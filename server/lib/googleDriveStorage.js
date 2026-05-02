const { Readable } = require("stream");
const { google } = require("googleapis");

const DRIVE_SCOPE = ["https://www.googleapis.com/auth/drive"];

const normalizePrivateKey = (value = "") => value.replace(/\\n/g, "\n");

const readCredentials = () => {
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

const getDriveConfig = () => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const { clientEmail, privateKey } = readCredentials();

  return {
    folderId: String(folderId || "").trim(),
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

  const { folderId, clientEmail, privateKey } = getDriveConfig();
  return Boolean(folderId && clientEmail && privateKey);
};

const createDriveClient = () => {
  const { clientEmail, privateKey } = getDriveConfig();
  const jwt = new google.auth.JWT(clientEmail, null, privateKey, DRIVE_SCOPE);
  return google.drive({ version: "v3", auth: jwt });
};

const makeDownloadUrl = (fileId) =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

const mapDriveUploadError = (error) => {
  const apiError = error?.response?.data?.error;
  const reasons = Array.isArray(apiError?.errors) ? apiError.errors : [];
  const reasonSet = new Set(reasons.map((item) => item?.reason).filter(Boolean));

  if (reasonSet.has("storageQuotaExceeded")) {
    return {
      statusCode: 400,
      fallbackToSupabase: true,
      message:
        "Google Drive upload failed: service account storage quota exceeded. Use a Shared Drive folder (recommended) or OAuth user credentials.",
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

  const { folderId } = getDriveConfig();
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
    const mapped = mapDriveUploadError(error);
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
