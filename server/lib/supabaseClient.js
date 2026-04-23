const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  const message =
    "Supabase env is not fully configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(message);
}

const supabase = createClient(
  SUPABASE_URL || "http://localhost",
  SUPABASE_SERVICE_ROLE_KEY || "dev-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

module.exports = {
  supabase,
};
