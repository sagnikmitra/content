const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = String(authHeader || "").replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  authenticateRequest,
};
