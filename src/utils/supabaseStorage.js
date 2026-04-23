import { supabase } from "./supabase";

const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "content-assets";

const sanitizeFilename = (filename = "file") =>
  filename.replace(/[^a-zA-Z0-9._-]/g, "_");

const createStoragePath = (filename) => {
  const unique =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `content/${unique}-${sanitizeFilename(filename)}`;
};

export const normalizeExistingPictures = (pictures = []) =>
  (Array.isArray(pictures) ? pictures : [])
    .filter((item) => item && typeof item === "object" && (item.id || item.path))
    .map((item) => {
      const path = String(item.path || item.id);
      return {
        id: path,
        path,
        url: item.url || "",
        filename: item.filename || item.name || path.split("/").pop() || "file",
      };
    });

export const uploadPicturesToSupabase = async (files = []) => {
  if (!files.length) {
    return [];
  }

  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  const uploaded = [];
  for (const file of files) {
    const path = createStoragePath(file.name || "asset");

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    uploaded.push({
      id: path,
      path,
      url: data?.publicUrl || "",
      filename: file.name || path.split("/").pop() || "file",
    });
  }

  return uploaded;
};
