const express = require("express");
const multer = require("multer");
const { supabase } = require("../lib/supabaseClient");
const {
  deleteFilesFromGoogleDrive,
  isGoogleDriveConfigured,
  uploadFilesToGoogleDrive,
} = require("../lib/googleDriveStorage");
const { authenticateRequest } = require("../middleware/authenticateRequest");

const router = express.Router();
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "content-assets";
const SCHEDULE_GRACE_MS = 60 * 1000;
const VALID_CONTENT_TYPES = new Set(["static", "video", "live"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 20,
    fileSize: 25 * 1024 * 1024,
  },
});
router.use(authenticateRequest);

let googleDriveUploadDisabledReason = null;

const uploadPicturesMiddleware = (req, res, next) => {
  upload.array("pictures", 20)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "File too large. Maximum allowed size is 25MB per file.",
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          error: "Too many files. You can upload up to 20 files at a time.",
        });
      }
    }

    return res.status(400).json({
      error: error.message || "Invalid upload request",
    });
  });
};

const mapContent = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    instagram: row.instagram || "",
    twitter: row.twitter || "",
    linkedin: row.linkedin || "",
    discord: row.discord || "",
    pictures: Array.isArray(row.pictures) ? row.pictures : [],
    time: row.time,
    date: row.date,
    type: row.type || "static",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUpdated: row.updated_at,
  };
};

const normalizePictureItem = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const path = String(item.path || item.id || "").trim();
  const url = String(item.url || "").trim();
  const filename = String(item.filename || item.name || "").trim();

  if (!path || !url) {
    return null;
  }

  return {
    id: path,
    path,
    provider: item.provider || null,
    url,
    filename: filename || path.split("/").pop() || "file",
  };
};

const normalizePictures = (value) => {
  if (!value) {
    return [];
  }

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];
  for (const picture of parsed) {
    const item = normalizePictureItem(picture);
    if (!item || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    normalized.push(item);
  }

  return normalized;
};

const normalizeDateOnly = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

const normalizeIsoTime = (timeValue) => {
  const parsed = new Date(timeValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const isBackdatedSchedule = (isoTimeValue, now = Date.now()) =>
  new Date(isoTimeValue).getTime() < now - SCHEDULE_GRACE_MS;

const normalizeText = (value) => String(value || "").trim();

const normalizeContentType = (value) => {
  const normalized = normalizeText(value || "static").toLowerCase();
  return VALID_CONTENT_TYPES.has(normalized) ? normalized : null;
};

const hasBodyContent = ({ description, instagram, twitter, linkedin, discord }) =>
  [
    description,
    instagram,
    twitter,
    linkedin,
    discord,
  ].some((value) => normalizeText(value));

const deletePicturesFromStorage = async (pictures) => {
  const normalized = normalizePictures(pictures);
  if (!normalized.length) {
    return;
  }

  const gdriveIds = [];
  const supabasePaths = [];

  for (const picture of normalized) {
    const path = picture.path || picture.id;
    const provider =
      picture.provider ||
      (String(path).includes("/") ? "supabase" : "gdrive");

    if (provider === "gdrive") {
      gdriveIds.push(path);
      continue;
    }

    supabasePaths.push(path);
  }

  const cleanupErrors = [];

  if (gdriveIds.length > 0) {
    if (!isGoogleDriveConfigured()) {
      cleanupErrors.push(
        new Error("Google Drive is not configured; cannot delete Drive files")
      );
    } else {
      try {
        await deleteFilesFromGoogleDrive(gdriveIds);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
  }

  if (supabasePaths.length > 0) {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([...new Set(supabasePaths)]);
      if (error) {
        throw error;
      }
    } catch (error) {
      cleanupErrors.push(error);
    }
  }

  if (cleanupErrors.length > 0) {
    const error = new Error("Failed to delete one or more stored files");
    error.causes = cleanupErrors;
    throw error;
  }
};

const sanitizeFilename = (filename = "file") =>
  filename.replace(/[^a-zA-Z0-9._-]/g, "_");

const createStoragePath = (filename) => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `content/${unique}-${sanitizeFilename(filename)}`;
};

const uploadFilesToSupabase = async (files = []) => {
  const uploaded = [];

  try {
    for (const file of files) {
      const path = createStoragePath(file.originalname || "asset");
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file.buffer, {
          upsert: false,
          contentType: file.mimetype || "application/octet-stream",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      uploaded.push({
        id: path,
        path,
        provider: "supabase",
        url: data?.publicUrl || "",
        filename: file.originalname || path.split("/").pop() || "file",
        mimeType: file.mimetype || "application/octet-stream",
      });
    }
  } catch (error) {
    if (uploaded.length > 0) {
      try {
        await deletePicturesFromStorage(uploaded);
      } catch (cleanupError) {
        console.error("Error cleaning up partial Supabase uploads:", cleanupError);
      }
    }
    throw error;
  }

  return uploaded;
};

const isGoogleDriveUploadAvailable = () => {
  if (googleDriveUploadDisabledReason) {
    return false;
  }

  try {
    return isGoogleDriveConfigured();
  } catch (error) {
    googleDriveUploadDisabledReason = error.message;
    console.warn(
      "Google Drive upload unavailable; falling back to Supabase Storage:",
      googleDriveUploadDisabledReason
    );
    return false;
  }
};

const uploadFilesToConfiguredStorage = async (files = []) => {
  if (!isGoogleDriveUploadAvailable()) {
    return uploadFilesToSupabase(files);
  }

  try {
    return await uploadFilesToGoogleDrive(files);
  } catch (error) {
    if (!error?.fallbackToSupabase) {
      throw error;
    }

    const partialUploads = normalizePictures(error.partialUploads);
    if (partialUploads.length > 0) {
      await deletePicturesFromStorage(partialUploads);
    }

    googleDriveUploadDisabledReason = error.message;
    console.warn(
      "Google Drive upload unavailable; falling back to Supabase Storage:",
      googleDriveUploadDisabledReason
    );
    return uploadFilesToSupabase(files);
  }
};

router.post("/add-image", uploadPicturesMiddleware, async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const pictures = await uploadFilesToConfiguredStorage(files);

    return res.status(201).json({ pictures });
  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Failed to upload files",
    });
  }
});

router.delete("/delete-image", async (req, res) => {
  try {
    const { picture } = req.body || {};
    const normalized = normalizePictureItem(picture);
    if (!normalized) {
      return res.status(400).json({ error: "Invalid picture payload" });
    }

    await deletePicturesFromStorage([normalized]);
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "Failed to delete image" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      instagram,
      twitter,
      linkedin,
      discord,
      time,
      date,
      type,
      pictures,
    } = req.body || {};

    const normalizedTitle = normalizeText(title);
    if (!normalizedTitle) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!hasBodyContent({ description, instagram, twitter, linkedin, discord })) {
      return res.status(400).json({
        error: "Description or channel copy is required",
      });
    }

    if (!time || !date) {
      return res.status(400).json({ error: "Time and date are required" });
    }

    const normalizedDate = normalizeDateOnly(date);
    const normalizedTime = normalizeIsoTime(time);

    if (!normalizedDate || !normalizedTime) {
      return res.status(400).json({ error: "Invalid date or time format" });
    }

    if (isBackdatedSchedule(normalizedTime)) {
      return res.status(400).json({
        error: "Schedule date and time cannot be in the past",
      });
    }

    const normalizedType = normalizeContentType(type);
    if (!normalizedType) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const payload = {
      title: normalizedTitle,
      description: normalizeText(description),
      type: normalizedType,
      instagram: instagram || "",
      twitter: twitter || "",
      linkedin: linkedin || "",
      discord: discord || "",
      pictures: normalizePictures(pictures),
      time: normalizedTime,
      date: normalizedDate,
    };

    const { data, error } = await supabase
      .from("content_items")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: "Content created successfully!",
      content: mapContent(data),
    });
  } catch (error) {
    console.error("Error creating content:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("content_items")
      .select("id, updated_at, date, time, type, title, description")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const formattedContents = (data || []).map((content) => ({
      _id: content.id,
      lastUpdated: content.updated_at,
      date: content.date,
      time: content.time,
      type: content.type,
      description: content.description,
      title: content.title,
    }));

    return res.status(200).json(formattedContents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const contentId = req.params.id;

    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", contentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "Content not found" });
    }

    return res.status(200).json(mapContent(data));
  } catch (error) {
    console.error("Error fetching content:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const contentId = req.params.id;

    const {
      title,
      description,
      instagram,
      twitter,
      linkedin,
      discord,
      time,
      date,
      type,
      pictures,
    } = req.body || {};

    const normalizedTitle = normalizeText(title);
    if (!normalizedTitle) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!hasBodyContent({ description, instagram, twitter, linkedin, discord })) {
      return res.status(400).json({
        error: "Description or channel copy is required",
      });
    }

    if (!time || !date) {
      return res.status(400).json({ error: "Time and date are required" });
    }

    const normalizedDate = normalizeDateOnly(date);
    const normalizedTime = normalizeIsoTime(time);

    if (!normalizedDate || !normalizedTime) {
      return res.status(400).json({ error: "Invalid date or time format" });
    }

    if (isBackdatedSchedule(normalizedTime)) {
      return res.status(400).json({
        error: "Schedule date and time cannot be in the past",
      });
    }

    const { data: existingContent, error: existingError } = await supabase
      .from("content_items")
      .select("id, pictures")
      .eq("id", contentId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    const currentPictures = normalizePictures(existingContent.pictures);
    const updatedPictures =
      pictures === undefined
        ? currentPictures
        : normalizePictures(pictures);

    const imagesToDelete = currentPictures.filter(
      (current) =>
        !updatedPictures.some((updated) => updated.id === current.id)
    );

    const normalizedType = normalizeContentType(type);
    if (!normalizedType) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const payload = {
      title: normalizedTitle,
      description: normalizeText(description),
      instagram: instagram || "",
      twitter: twitter || "",
      linkedin: linkedin || "",
      discord: discord || "",
      pictures: updatedPictures,
      time: normalizedTime,
      date: normalizedDate,
      type: normalizedType,
    };

    const { data: updated, error: updateError } = await supabase
      .from("content_items")
      .update(payload)
      .eq("id", contentId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    if (imagesToDelete.length > 0) {
      try {
        await deletePicturesFromStorage(imagesToDelete);
      } catch (cleanupError) {
        console.error("Error cleaning up removed images after update:", cleanupError);
      }
    }

    return res.status(200).json({
      message: "Content updated successfully!",
      updatedContent: mapContent(updated),
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const contentId = req.params.id;

    const { data: content, error: findError } = await supabase
      .from("content_items")
      .select("id, pictures")
      .eq("id", contentId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    const picturesToDelete = normalizePictures(content.pictures);

    const { error: deleteError } = await supabase
      .from("content_items")
      .delete()
      .eq("id", contentId);

    if (deleteError) {
      throw deleteError;
    }

    if (picturesToDelete.length > 0) {
      try {
        await deletePicturesFromStorage(picturesToDelete);
      } catch (cleanupError) {
        console.error("Error cleaning up images after content delete:", cleanupError);
      }
    }

    return res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
