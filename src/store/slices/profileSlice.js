import { createSlice } from "@reduxjs/toolkit";

const TOKEN_STORAGE_KEY = "authToken";
const USER_STORAGE_KEY = "authUser";

const readTokenFromStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const readUserFromStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  token: readTokenFromStorage(),
  user: readUserFromStorage(),
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token || null;
      state.user = action.payload?.user || null;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const persistCredentials = ({ token, user }) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const clearPersistedCredentials = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};

export const { setCredentials, clearCredentials } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = (state) => state.profile;
export const selectIsAuthenticated = (state) =>
  Boolean(state.profile?.token);
