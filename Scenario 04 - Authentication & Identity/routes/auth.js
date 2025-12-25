const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Enter the credentials",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Make sure password length is above 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      email,
      password,
    });

    res.status(201).json({
      message: "User signedup",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    req.session.userId = user._id;
    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error occured, please try again",
    });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  res.json({
    message: "This is a protected route",
    userId: req.session.userId,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to logout",
      });
    }

    res.clearCookie("sid");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  });
});

module.exports = router;
