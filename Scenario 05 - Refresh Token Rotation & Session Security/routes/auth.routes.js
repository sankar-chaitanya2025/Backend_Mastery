const express = require("express");
const router = express.Router();

// Import auth controller which contains signup, login and refresh logic
const authController = require("../controllers/auth.controller");

// Route to create a new user account
router.post("/signup", authController.signup);

// Route to login user and issue access + refresh tokens
router.post("/login", authController.login);

// Route to rotate refresh token and issue new tokens
router.post("/refresh", authController.refresh);

// Export router to be used in server.js
module.exports = router;
