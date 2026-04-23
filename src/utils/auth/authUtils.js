// Validators and helpers
export const GENERIC_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
];

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

export const isValidUsername = (username) =>
  /^[a-zA-Z0-9._-]{3,32}$/.test((username || "").trim());

export const getDomain = (email) =>
  (email || "").split("@")[1]?.toLowerCase() || "";

export const isGenericDomain = (email) =>
  GENERIC_DOMAINS.includes(getDomain(email));

export const strongPassword = (pwd = "") => {
  const min = pwd.length >= 12,
    upper = /[A-Z]/.test(pwd),
    lower = /[a-z]/.test(pwd),
    digit = /\d/.test(pwd),
    special = /[^A-Za-z0-9]/.test(pwd);
  return {
    ok: min && upper && lower && digit && special,
    min,
    upper,
    lower,
    digit,
    special,
  };
};
