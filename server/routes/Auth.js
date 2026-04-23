const express = require("express");
const {
  getEmailStatus,
  loginUser,
  createEntry,
  logoutUser,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/email-status", getEmailStatus);
router.post("/login", loginUser);
router.post("/entry", createEntry);
router.post("/logout", logoutUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
