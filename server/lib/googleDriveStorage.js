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

const isGoogleDriveConfigured = () => {
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

const uploadFilesToGoogleDrive = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const { folderId } = getDriveConfig();
  const drive = createDriveClient();
  const uploaded = [];

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

    await drive.permissions.create({
      fileId: data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });

    uploaded.push({
      id: data.id,
      path: data.id,
      provider: "gdrive",
      url: makeDownloadUrl(data.id),
      filename: data.name || file.originalname || "file",
      mimeType: data.mimeType || file.mimetype || "application/octet-stream",
    });
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
