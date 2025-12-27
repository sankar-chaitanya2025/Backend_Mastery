const mongoose = require("mongoose");

// This schema stores basic user identity and login credentials
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // ensures one account per email
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, // basic email validation
  },
  passwordHash: {
    type: String,
    required: true, // stores hashed password, never plain password
  },
});

// This model represents the user account itself
module.exports = mongoose.model("User", UserSchema);
