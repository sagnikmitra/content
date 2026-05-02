import axios from "axios";
import {
  clearPersistedAuthSession,
  readStoredAuthToken,
  redirectToAuth,
} from "@utils/auth/session";

const REQUEST_TIMEOUT_MS = 30000;
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim();

export const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
});

axiosInstance.interceptors.request.use((config) => {
  const token = readStoredAuthToken();
  if (!token) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearPersistedAuthSession();
      redirectToAuth();
    }

    return Promise.reject(error);
  }
);

export const apiConnector = async (method, url, bodyData, headers, params) => {
  const resolvedHeaders = headers?.headers ? headers.headers : headers;
  const isFormData =
    typeof FormData !== "undefined" && bodyData instanceof FormData;

  try {
    return await axiosInstance({
      method,
      url,
      data: bodyData ? bodyData : null,
      headers: resolvedHeaders ? resolvedHeaders : null,
      params: params ? params : null,
      crossOrigin: true,
      ...(isFormData ? { maxBodyLength: Infinity, maxContentLength: Infinity } : {}),
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    }

    const timedOut = error?.code === "ECONNABORTED";
    const urlValue = String(url || "");
    const isRelativeApiPath = urlValue.startsWith("/");
    const frontendHost =
      typeof window !== "undefined" ? String(window.location.hostname || "") : "";
    const likelySplitDeploy =
      Boolean(frontendHost) &&
      !/^(localhost|127\.0\.0\.1)$/i.test(frontendHost) &&
      !API_BASE_URL &&
      isRelativeApiPath;

    const setupHint = likelySplitDeploy
      ? " Set VITE_API_BASE_URL to your deployed backend URL."
      : "";
    const timeoutHint = timedOut
      ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.${setupHint}`
      : "";
    const rawMessage = String(error?.message || "");
    const networkFailureMessage =
      `Network request failed. Check backend availability and API base URL.${setupHint}`;

    return {
      status: 0,
      data: {
        message:
          timeoutHint ||
          (rawMessage && rawMessage !== "Network Error"
            ? rawMessage
            : networkFailureMessage),
      },
    };
  }
};
