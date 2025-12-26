const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const RefreshSession = require("../models/RefreshSession");
const { generateRefreshToken, hashToken } = require("../utils/crypto");

const JWT_SECRET = "ILOVE100XDEVS";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please enter credentials",
    });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      error: "Invalid credentials",
    });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({
      error: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = generateRefreshToken();

  await RefreshSession.create({
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
  });

  return res.json({
    accessToken,
    refreshToken,
  });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "Token is missing",
    });
  }

  const hashedToken = hashToken(refreshToken);
  const session = await RefreshSession.findOne({
    refreshTokenHash: hashedToken,
  });

  if (!session) {
    return res.status(401).json({
      error: "Invalid or reused refresh token. Please login again.",
    });
  }
  await RefreshSession.deleteOne({ _id: session._id });

  const newAccessToken = jwt.sign({ userId: session.userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = generateRefreshToken();

  await RefreshSession.create({
    userId: session.userId,
    refreshTokenHash: hashToken(newRefreshToken),
  });

  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});
