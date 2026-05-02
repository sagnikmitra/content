import { createSlice } from "@reduxjs/toolkit";
import {
  clearPersistedAuthSession,
  isTokenExpired,
  persistAuthSession,
  readStoredAuthToken,
  readStoredAuthUser,
} from "@utils/auth/session";

const initialState = {
  token: readStoredAuthToken(),
  user: readStoredAuthUser(),
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
  persistAuthSession({ token, user });
};

export const clearPersistedCredentials = () => {
  clearPersistedAuthSession();
};

export const { setCredentials, clearCredentials } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = (state) => state.profile;
export const selectIsAuthenticated = (state) =>
  Boolean(state.profile?.token) && !isTokenExpired(state.profile.token);
