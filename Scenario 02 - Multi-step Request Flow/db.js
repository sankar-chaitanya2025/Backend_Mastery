import { mongoose } from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27018/");
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed ", error);
    process.exit(1);
  }
}
