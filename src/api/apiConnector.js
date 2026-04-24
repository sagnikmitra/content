import axios from "axios";

export const axiosInstance = axios.create({});
const TOKEN_STORAGE_KEY = "authToken";

axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
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

export const apiConnector = async (method, url, bodyData, headers, params) => {
  const resolvedHeaders = headers?.headers ? headers.headers : headers;

  try {
    return await axiosInstance({
      method,
      url,
      data: bodyData ? bodyData : null,
      headers: resolvedHeaders ? resolvedHeaders : null,
      params: params ? params : null,
      crossOrigin: true,
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return {
      status: 0,
      data: {
        message:
          error?.message ||
          "Network request failed. Check API base URL and backend availability.",
      },
    };
  }
};
