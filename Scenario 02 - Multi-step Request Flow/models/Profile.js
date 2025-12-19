const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // special MongoDB ID type
    ref: "User", // tells mongoose: this ObjectId belongs to the User model
    required: true, // profile MUST belong to a user
  },

  fullName: {
    type: String,
    required: true,
  },

  course: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the actual model used to read/write Profile documents
const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
