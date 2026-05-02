const { Readable } = require("stream");
const { google } = require("googleapis");

const DRIVE_SCOPE = ["https://www.googleapis.com/auth/drive"];
const DEFAULT_OAUTH_REDIRECT_URI = "http://localhost";

const normalizePrivateKey = (value = "") => value.replace(/\\n/g, "\n");

const readServiceAccountCredentials = () => {
  const rawJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      return {
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch (error) {
      throw new Error("Invalid GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON");
    }
  }

  return {
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };
};

const readOAuthCredentials = () => ({
  clientId: String(process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID || "").trim(),
  clientSecret: String(process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET || "").trim(),
  refreshToken: String(process.env.GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN || "").trim(),
  redirectUri: String(
    process.env.GOOGLE_DRIVE_OAUTH_REDIRECT_URI || DEFAULT_OAUTH_REDIRECT_URI
  ).trim(),
});

const isOAuthConfigured = (credentials = readOAuthCredentials()) =>
  Boolean(credentials.clientId && credentials.clientSecret && credentials.refreshToken);

const getDriveConfig = () => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const oauth = readOAuthCredentials();

  if (isOAuthConfigured(oauth)) {
    return {
      folderId: String(folderId || "").trim(),
      authMode: "oauth",
      oauth,
    };
  }

  const { clientEmail, privateKey } = readServiceAccountCredentials();

  return {
    folderId: String(folderId || "").trim(),
    authMode: "service_account",
    clientEmail: String(clientEmail || "").trim(),
    privateKey: normalizePrivateKey(String(privateKey || "").trim()),
  };
};

const isDriveExplicitlyDisabled = () => {
  const raw = String(process.env.GOOGLE_DRIVE_ENABLED || "").trim().toLowerCase();
  return ["0", "false", "off", "no"].includes(raw);
};

const isGoogleDriveConfigured = () => {
  if (isDriveExplicitlyDisabled()) {
    return false;
  }

  const config = getDriveConfig();
  if (!config.folderId) {
    return false;
  }

  if (config.authMode === "oauth") {
    return isOAuthConfigured(config.oauth);
  }

  return Boolean(config.clientEmail && config.privateKey);
};

const createDriveClient = () => {
  const config = getDriveConfig();
  if (config.authMode === "oauth") {
    const oauthClient = new google.auth.OAuth2(
      config.oauth.clientId,
      config.oauth.clientSecret,
      config.oauth.redirectUri
    );
    oauthClient.setCredentials({ refresh_token: config.oauth.refreshToken });
    return google.drive({ version: "v3", auth: oauthClient });
  }

  const { clientEmail, privateKey } = config;
  const jwt = new google.auth.JWT(clientEmail, null, privateKey, DRIVE_SCOPE);
  return google.drive({ version: "v3", auth: jwt });
};

const makeDownloadUrl = (fileId) =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

const mapDriveUploadError = (error, authMode) => {
  const responseError = error?.response?.data?.error;
  const apiError =
    responseError && typeof responseError === "object" ? responseError : {};
  const errorCode =
    typeof responseError === "string"
      ? responseError
      : apiError?.status || apiError?.code || error?.code;
  const errorMessage = String(
    error?.response?.data?.error_description ||
      apiError?.message ||
      error?.message ||
      ""
  );
  const reasons = Array.isArray(apiError?.errors) ? apiError.errors : [];
  const reasonSet = new Set(reasons.map((item) => item?.reason).filter(Boolean));

  if (
    ["invalid_grant", "invalid_token", "unauthorized_client"].includes(errorCode) ||
    /invalid.*(grant|token)|expired.*token/i.test(errorMessage)
  ) {
    return {
      statusCode: 401,
      message:
        "Google Drive OAuth token is invalid or expired. Regenerate GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN with the configured OAuth client.",
    };
  }

  if (reasonSet.has("storageQuotaExceeded")) {
    const message =
      authMode === "oauth"
        ? "Google Drive upload failed: the authenticated Google account has no available Drive storage."
        : "Google Drive upload failed: service-account uploads to My Drive need service-account storage quota. Use OAuth user credentials for a My Drive folder, or move the target folder into a Shared Drive.";

    return {
      statusCode: 400,
      fallbackToSupabase: true,
      message,
    };
  }

  if (reasonSet.has("insufficientFilePermissions")) {
    return {
      statusCode: 403,
      message:
        "Google Drive upload failed: service account does not have editor access to the target folder.",
    };
  }

  if (reasonSet.has("notFound")) {
    return {
      statusCode: 404,
      message:
        "Google Drive upload failed: target folder not found. Verify GOOGLE_DRIVE_FOLDER_ID and sharing.",
    };
  }

  if (reasonSet.has("invalidSharingRequest")) {
    return {
      statusCode: 400,
      message:
        "Google Drive upload failed: cannot make file public in current Drive settings.",
    };
  }

  return {
    statusCode: Number(error?.code) || 500,
    message: "Google Drive upload failed. Check Drive API access and folder permissions.",
  };
};

const uploadFilesToGoogleDrive = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const { folderId, authMode } = getDriveConfig();
  const drive = createDriveClient();
  const uploaded = [];
  const createdFiles = [];

  try {
    for (const file of files) {
      const { data } = await drive.files.create({
        requestBody: {
          name: file.originalname || "asset",
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype || "application/octet-stream",
          body: Readable.from(file.buffer),
        },
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });

      const uploadedFile = {
        id: data.id,
        path: data.id,
        provider: "gdrive",
        url: makeDownloadUrl(data.id),
        filename: data.name || file.originalname || "file",
        mimeType: data.mimeType || file.mimetype || "application/octet-stream",
      };
      createdFiles.push(uploadedFile);

      await drive.permissions.create({
        fileId: data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });

      uploaded.push(uploadedFile);
    }
  } catch (error) {
    const mapped = mapDriveUploadError(error, authMode);
    const enhanced = new Error(mapped.message);
    enhanced.statusCode = mapped.statusCode;
    enhanced.fallbackToSupabase = Boolean(mapped.fallbackToSupabase);
    enhanced.partialUploads = createdFiles;
    enhanced.cause = error;
    throw enhanced;
  }

  return uploaded;
};

const deleteFilesFromGoogleDrive = async (fileIds = []) => {
  const ids = [...new Set((fileIds || []).filter(Boolean))];
  if (!ids.length) {
    return;
  }

  const drive = createDriveClient();
  await Promise.all(
    ids.map(async (fileId) => {
      try {
        await drive.files.delete({ fileId, supportsAllDrives: true });
      } catch (error) {
        if (error?.code !== 404) {
          throw error;
        }
      }
    })
  );
};

module.exports = {
  isGoogleDriveConfigured,
  uploadFilesToGoogleDrive,
  deleteFilesFromGoogleDrive,
  makeDownloadUrl,
};
