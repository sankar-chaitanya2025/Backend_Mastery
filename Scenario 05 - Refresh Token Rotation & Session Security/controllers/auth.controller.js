// User model to read and write user data from database
const User = require("../models/User");

// JWT library to sign and verify access tokens
const jwt = require("jsonwebtoken");

// bcrypt is used to hash passwords and compare hashes safely
const bcrypt = require("bcrypt");

// Model that stores refresh token sessions in DB
const RefreshSession = require("../models/RefreshSession");

// Helpers to generate random refresh tokens and hash them
const { generateRefreshToken, hashToken } = require("../utils/crypto");

// Secret key used to sign JWT (should be env var in real apps)
const JWT_SECRET = "ILOVE100XDEVS";

async function login(req, res) {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Basic validation to avoid empty login attempts
  if (!email || !password) {
    return res.status(400).json({
      error: "Please enter credentials",
    });
  }

  // Find user by email from database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      error: "Invalid credentials",
    });
  }

  // Compare plain password with stored password hash
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({
      error: "Invalid credentials",
    });
  }

  // Create short-lived access token for API access
  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  // Generate long random refresh token for session continuation
  const refreshToken = generateRefreshToken();

  // Store only hashed refresh token in DB for security
  await RefreshSession.create({
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
  });

  // Send both tokens to client
  return res.json({
    accessToken,
    refreshToken,
  });
}

async function refresh(req, res) {
  // Extract refresh token sent by client
  const { refreshToken } = req.body;

  // If refresh token is missing, request is invalid
  if (!refreshToken) {
    return res.status(400).json({
      error: "Token is missing",
    });
  }

  // Hash incoming refresh token to compare with DB
  const hashedToken = hashToken(refreshToken);

  // Find matching refresh session from database
  const session = await RefreshSession.findOne({
    refreshTokenHash: hashedToken,
  });

  // If no session found, token is reused or stolen
  if (!session) {
    return res.status(401).json({
      error: "Invalid or reused refresh token. Please login again.",
    });
  }

  // Delete old refresh session to enforce rotation
  await RefreshSession.deleteOne({ _id: session._id });

  // Issue new short-lived access token
  const newAccessToken = jwt.sign({ userId: session.userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  // Generate new refresh token for next rotation
  const newRefreshToken = generateRefreshToken();

  // Store hash of new refresh token in DB
  await RefreshSession.create({
    userId: session.userId,
    refreshTokenHash: hashToken(newRefreshToken),
  });

  // Return newly issued tokens to client
  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}

async function signup(req, res) {
  // Extract email and password from signup request
  const { email, password } = req.body;

  // Validate input before creating user
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password required",
    });
  }

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({
      error: "User already exists",
    });
  }

  // Hash password before storing in DB
  const passwordHash = await bcrypt.hash(password, 10);

  // Create new user with hashed password
  await User.create({
    email,
    passwordHash,
  });

  // Confirm successful user creation
  return res.status(201).json({
    message: "User created",
  });
}

// Export controller functions for routing layer
module.exports = {
  signup,
  login,
  refresh,
};
