const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27018/");
    console.log("Mongodb has been connected");
  } catch (error) {
    console.error("Mongodb has been failed to connect");
  }
}
