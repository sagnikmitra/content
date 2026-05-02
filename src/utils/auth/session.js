export const TOKEN_STORAGE_KEY = "authToken";
export const USER_STORAGE_KEY = "authUser";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const decodeBase64Url = (value) => {
  try {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );
    return window.atob(padded);
  } catch {
    return null;
  }
};

export const parseJwtPayload = (token) => {
  const payload = String(token || "").split(".")[1];
  if (!payload) {
    return null;
  }

  const decoded = decodeBase64Url(payload);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const payload = parseJwtPayload(token);
  const expirySeconds = Number(payload?.exp);

  return Number.isFinite(expirySeconds) ? expirySeconds * 1000 : null;
};

export const isTokenExpired = (token, now = Date.now()) => {
  if (!token) {
    return true;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return true;
  }

  return expiryMs <= now;
};

export const clearPersistedAuthSession = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(TOKEN_STORAGE_KEY);
    storage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing or blocked contexts.
  }
};

export const persistAuthSession = ({ token, user }) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (!token || isTokenExpired(token)) {
      clearPersistedAuthSession();
      return;
    }

    storage.setItem(TOKEN_STORAGE_KEY, token);

    if (user) {
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      storage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in private browsing or blocked contexts.
  }
};

export const readStoredAuthToken = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const token = storage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }

    if (isTokenExpired(token)) {
      clearPersistedAuthSession();
      return null;
    }

    return token;
  } catch {
    return null;
  }
};

export const readStoredAuthUser = () => {
  const storage = getStorage();
  if (!storage || !readStoredAuthToken()) {
    return null;
  }

  try {
    const raw = storage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const redirectToAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  const { pathname, search } = window.location;
  if (pathname === "/auth") {
    return;
  }

  const next = encodeURIComponent(`${pathname}${search}`);
  window.location.assign(`/auth?next=${next}&session=expired`);
};
