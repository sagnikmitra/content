import { ADD_IMAGE_API, DELETE_IMAGE_API } from "@api/apiList";
import { apiConnector } from "@api/apiConnector";

const MAX_UPLOAD_FILES_PER_REQUEST = 20;
const MAX_UPLOAD_FILE_BYTES = 25 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)}KB`;
  }

  return `${Math.ceil(bytes / (1024 * 1024))}MB`;
};

const validateUploadFiles = (files = []) => {
  const oversized = files.find((file) => file?.size > MAX_UPLOAD_FILE_BYTES);
  if (!oversized) {
    return;
  }

  throw new Error(
    `${oversized.name || "File"} is too large. Maximum allowed size is ${formatBytes(
      MAX_UPLOAD_FILE_BYTES
    )}.`
  );
};

export const normalizeExistingPictures = (pictures = []) =>
  (Array.isArray(pictures) ? pictures : [])
    .filter((item) => item && typeof item === "object" && (item.id || item.path))
    .map((item) => {
      const path = String(item.path || item.id);
      return {
        id: path,
        path,
        provider: item.provider || null,
        url: item.url || "",
        filename: item.filename || item.name || path.split("/").pop() || "file",
      };
    });

const uploadPictureBatch = async (files = []) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("pictures", file);
  }

  const response = await apiConnector("POST", ADD_IMAGE_API, formData);
  if (response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Failed to upload files"
    );
  }

  return normalizeExistingPictures(response.data?.pictures || []);
};

const deleteUploadedPicture = async (picture) => {
  const response = await apiConnector("DELETE", DELETE_IMAGE_API, { picture });
  if (response.status !== 200) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Failed to clean up uploaded file"
    );
  }
};

const deleteUploadedPictures = async (pictures = []) => {
  await Promise.allSettled(pictures.map((picture) => deleteUploadedPicture(picture)));
};

export const resolvePictureDownloadUrl = (picture) => {
  if (!picture || typeof picture !== "object") {
    return "";
  }

  if (picture.url) {
    return picture.url;
  }

  const id = picture.path || picture.id;
  if (!id) {
    return "";
  }

  const provider = picture.provider || (String(id).includes("/") ? "supabase" : "gdrive");
  if (provider === "gdrive") {
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }

  return "";
};

export const uploadPicturesToStorage = async (files = []) => {
  if (!files.length) {
    return [];
  }

  validateUploadFiles(files);

  const uploaded = [];
  try {
    for (let index = 0; index < files.length; index += MAX_UPLOAD_FILES_PER_REQUEST) {
      const batch = files.slice(index, index + MAX_UPLOAD_FILES_PER_REQUEST);
      uploaded.push(...await uploadPictureBatch(batch));
    }
  } catch (error) {
    if (uploaded.length > 0) {
      await deleteUploadedPictures(uploaded);
    }
    throw error;
  }

  return uploaded;
};

export const uploadPicturesToSupabase = uploadPicturesToStorage;
