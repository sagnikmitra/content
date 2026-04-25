const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { supabase } = require("../lib/supabaseClient");
const { ensureAdminInitialized } = require("../bootstrap/adminUser");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const DEFAULT_ADMIN_USERNAME_FALLBACK = "admin";
const DEFAULT_ADMIN_EMAIL_FALLBACK = "admin@adm.in";
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin")
  .trim()
  .toLowerCase();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@adm.in")
  .trim()
  .toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const normalizeUsername = (value) => (value || "").trim().toLowerCase();
const isAdminIdentifier = (identifier) => {
  const candidate = String(identifier || "").trim();
  if (!candidate) {
    return false;
  }

  if (isValidEmail(candidate)) {
    return normalizeEmail(candidate) === ADMIN_EMAIL;
  }

  return normalizeUsername(candidate) === ADMIN_USERNAME;
};

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    _id: row.id,
    username: row.username || null,
    email: row.email,
    accountType: row.account_type,
    organizationName: row.organization_name || null,
    name: row.name || null,
    avatarUrl: row.avatar_url || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const resolveAvailableUsername = async (base) => {
  const normalized = normalizeUsername(base).replace(/[^a-z0-9._-]/g, "");
  let candidate = normalized || `user${Date.now()}`;
  let suffix = 0;

  while (true) {
    const { data, error } = await supabase
      .from("app_users")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    suffix += 1;
    candidate = `${normalized || "user"}${suffix}`;
  }
};

const fetchUserForLogin = async (candidate) => {
  const normalizedCandidate = String(candidate || "").trim();
  const query = supabase.from("app_users").select("*");
  const userQuery = isValidEmail(normalizedCandidate)
    ? query.eq("email", normalizeEmail(normalizedCandidate))
    : query.eq("username", normalizeUsername(normalizedCandidate));

  const { data, error } = await userQuery.maybeSingle();
  if (error) {
    throw error;
  }
  return data;
};

const mapAuthErrorMessage = (error) => {
  const rawMessage = String(error?.message || "");

  if (rawMessage.includes("relation") && rawMessage.includes("app_users")) {
    return "Database not initialized. Run server/supabase/schema.sql in Supabase SQL Editor.";
  }

  if (
    rawMessage.includes("Invalid API key") ||
    rawMessage.includes("JWT") ||
    rawMessage.includes("401")
  ) {
    return "Supabase credentials are invalid. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";
  }

  return null;
};

exports.getEmailStatus = async (req, res) => {
  try {
    await ensureAdminInitialized();
    const { email, identifier } = req.body || {};
    const candidate = (identifier || email || "").trim();

    if (!candidate) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    if (!isAdminIdentifier(candidate)) {
      return res.status(403).json({ message: "Only admin login is allowed" });
    }

    return res.status(200).json({
      exists: true,
      nextStep: "existing_password",
      identifier: isValidEmail(candidate) ? ADMIN_EMAIL : ADMIN_USERNAME,
    });
  } catch (error) {
    console.error("Auth:getEmailStatus error:", error);
    const mappedMessage = mapAuthErrorMessage(error);
    return res.status(500).json({
      message: mappedMessage || "Failed to resolve email status",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    await ensureAdminInitialized();
    const { email, identifier, password } = req.body || {};
    const candidate = (identifier || email || "").trim();

    if (!candidate || !password) {
      return res
        .status(400)
        .json({ message: "Email/username and password are both required" });
    }

    const user = await fetchUserForLogin(candidate);

    const isConfiguredAdmin =
      normalizeEmail(user?.email) === ADMIN_EMAIL ||
      normalizeUsername(user?.username) === ADMIN_USERNAME;
    const isFallbackAdmin =
      normalizeEmail(user?.email) === DEFAULT_ADMIN_EMAIL_FALLBACK ||
      normalizeUsername(user?.username) === DEFAULT_ADMIN_USERNAME_FALLBACK;
    const isAllowedUser = isConfiguredAdmin || isFallbackAdmin;

    if (!user || !user.password_hash || !isAllowedUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(200).json({
      token,
      user: mapUser(user),
    });
  } catch (error) {
    console.error("Auth:loginUser error:", error);
    const mappedMessage = mapAuthErrorMessage(error);
    return res.status(500).json({
      message: mappedMessage || "Failed to sign in",
    });
  }
};

exports.createEntry = async (_req, res) => {
  return res.status(403).json({
    message: "Sign-up is disabled. Only admin login is allowed",
  });
};

exports.logoutUser = async (_req, res) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Auth:logoutUser error:", error);
    return res.status(500).json({ message: "Failed to logout" });
  }
};

exports.requestPasswordReset = async (_req, res) => {
  return res.status(403).json({
    message: "Password reset is disabled. Contact the administrator",
  });
};

exports.resetPassword = async (_req, res) => {
  return res.status(403).json({
    message: "Password reset is disabled. Contact the administrator",
  });
};
