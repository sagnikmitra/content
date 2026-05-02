// Default: same-origin API. In local Vite dev, Express routes are mounted into
// Vite so `/auth` and `/content` work without a separate backend process.
// Set VITE_USE_DEV_API_URL=true to force a split local API target.
const USE_DEV_API_URL =
  import.meta.env.DEV &&
  String(import.meta.env.VITE_USE_DEV_API_URL || "").toLowerCase() === "true";
const DEV_BASE_URL = USE_DEV_API_URL
  ? String(import.meta.env.VITE_DEV_API_URL || "").trim()
  : "";
const RAW_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || DEV_BASE_URL || ""
).trim();
export const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

// list of all APIS
export const AUTH_EMAIL_STATUS_API = `${BASE_URL}/auth/email-status`;
export const AUTH_LOGIN_API = `${BASE_URL}/auth/login`;
export const AUTH_ENTRY_API = `${BASE_URL}/auth/entry`;
export const AUTH_LOGOUT_API = `${BASE_URL}/auth/logout`;
export const AUTH_FORGOT_PASSWORD_API = `${BASE_URL}/auth/forgot-password`;
export const AUTH_RESET_PASSWORD_API = `${BASE_URL}/auth/reset-password`;

export const ADD_CONTENT_API = `${BASE_URL}/content/create`;
export const UPDATE_CONTENT_API = `${BASE_URL}/content/update`;
export const DELETE_CONTENT_API = `${BASE_URL}/content/delete`;
export const DELETE_IMAGE_API = `${BASE_URL}/content/delete-image`;
export const ADD_IMAGE_API = `${BASE_URL}/content/add-image`;
export const GET_ALL_CONTENT = `${BASE_URL}/content/all`;
export const GET_CONTENT_BY_ID = `${BASE_URL}/content`;
