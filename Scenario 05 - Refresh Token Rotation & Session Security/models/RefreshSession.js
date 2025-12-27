const mongoose = require("mongoose");

// This schema represents one login session using refresh token
const RefreshSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true, // used to quickly find all sessions of a user
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true, // ensures same refresh token cannot exist twice
  },
  createdAt: {
    type: Date,
    default: Date.now, // helps track when this session was created
  },
});

// Each document here means one active refresh token session
module.exports = mongoose.model("RefreshSession", RefreshSessionSchema);
