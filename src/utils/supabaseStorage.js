import { ADD_IMAGE_API } from "@api/apiList";
import { apiConnector } from "@api/apiConnector";

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

export const uploadPicturesToSupabase = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("pictures", file);
  }

  const response = await apiConnector("POST", ADD_IMAGE_API, formData);
  if (response.status !== 201) {
    throw new Error(response.data?.error || "Failed to upload files");
  }

  return normalizeExistingPictures(response.data?.pictures || []);
};
