const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const DRIVE_SCOPE = ["https://www.googleapis.com/auth/drive"];
const DEFAULT_REDIRECT_URI = "http://localhost";

const ask = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const createClient = () => {
  const clientId = String(process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = String(
    process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET || ""
  ).trim();
  const redirectUri = String(
    process.env.GOOGLE_DRIVE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI
  ).trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set GOOGLE_DRIVE_OAUTH_CLIENT_ID and GOOGLE_DRIVE_OAUTH_CLIENT_SECRET first."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const main = async () => {
  const client = createClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: DRIVE_SCOPE,
  });

  console.log("\nOpen this URL with the Google account that owns or can edit the folder:\n");
  console.log(url);

  const code = process.argv[2] || (await ask("\nPaste the returned code: "));
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Re-run with prompt=consent and the same OAuth client."
    );
  }

  console.log("\nAdd this to .env and Vercel:");
  console.log(`GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN="${tokens.refresh_token}"`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
