import { apiConnector } from "./apiConnector";
import {
  AUTH_EMAIL_STATUS_API,
  AUTH_ENTRY_API,
  AUTH_FORGOT_PASSWORD_API,
  AUTH_LOGIN_API,
  AUTH_LOGOUT_API,
  AUTH_RESET_PASSWORD_API,
} from "./apiList";

const isSuccessStatus = (status) => status >= 200 && status < 300;

export const checkEmailStatus = async (identifier) => {
  const response = await apiConnector("POST", AUTH_EMAIL_STATUS_API, {
    identifier,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to verify email");
  }

  return response.data;
};

export const loginWithPassword = async ({ identifier, password }) => {
  const response = await apiConnector("POST", AUTH_LOGIN_API, {
    identifier,
    password,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to sign in");
  }

  return response.data;
};

export const createEntryAccount = async (payload) => {
  const response = await apiConnector("POST", AUTH_ENTRY_API, payload);

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to create account");
  }

  return response.data;
};

export const logoutUser = async (token) => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const response = await apiConnector("POST", AUTH_LOGOUT_API, null, headers);

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to logout");
  }

  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await apiConnector("POST", AUTH_FORGOT_PASSWORD_API, {
    email,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to request reset");
  }

  return response.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await apiConnector("POST", AUTH_RESET_PASSWORD_API, {
    token,
    password,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to reset password");
  }

  return response.data;
};
