const bcrypt = require("bcrypt");
const { supabase } = require("../lib/supabaseClient");

const BCRYPT_SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS || process.env.BCRYPT_ROUNDS || "10",
  10
);

const DEFAULT_ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin")
  .trim()
  .toLowerCase();
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@adm.in")
  .trim()
  .toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const ensureDefaultAdminUser = async () => {
  const username = DEFAULT_ADMIN_USERNAME;
  const email = DEFAULT_ADMIN_EMAIL;

  if (!username || !email || !DEFAULT_ADMIN_PASSWORD) {
    return;
  }

  const { data: usernameMatch, error: usernameError } = await supabase
    .from("app_users")
    .select("id, username, email, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (usernameError) {
    throw usernameError;
  }

  const { data: emailMatch, error: emailError } = await supabase
    .from("app_users")
    .select("id, username, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (emailError) {
    throw emailError;
  }

  const existing = usernameMatch || emailMatch;

  const passwordHash = await bcrypt.hash(
    DEFAULT_ADMIN_PASSWORD,
    BCRYPT_SALT_ROUNDS
  );

  if (!existing) {
    const { error: insertError } = await supabase.from("app_users").insert({
      username,
      email,
      password_hash: passwordHash,
      account_type: "org",
      organization_name: "Studio",
      name: "Administrator",
      status: "active",
    });

    if (insertError) {
      throw insertError;
    }

    console.log("Default admin user created");
    return;
  }

  const passwordMatches = await bcrypt.compare(
    DEFAULT_ADMIN_PASSWORD,
    existing.password_hash
  );

  const payload = {};
  if (!existing.username || existing.username !== username) {
    payload.username = username;
  }
  if (!existing.email || existing.email !== email) {
    payload.email = email;
  }
  if (!passwordMatches) {
    payload.password_hash = passwordHash;
  }

  if (Object.keys(payload).length > 0) {
    const { error: updateError } = await supabase
      .from("app_users")
      .update(payload)
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    console.log("Default admin user credentials synchronized");
  }
};

let adminBootstrapPromise = null;
const ensureAdminInitialized = async () => {
  if (!adminBootstrapPromise) {
    adminBootstrapPromise = ensureDefaultAdminUser().catch((error) => {
      adminBootstrapPromise = null;
      throw error;
    });
  }
  return adminBootstrapPromise;
};

module.exports = {
  ensureDefaultAdminUser,
  ensureAdminInitialized,
};
