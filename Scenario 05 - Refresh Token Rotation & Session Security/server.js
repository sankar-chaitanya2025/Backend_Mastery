const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");

const app = express();

// 🔥 CONNECT DB FIRST
connectDB();

app.use(express.json());
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
