const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();

// Connect to MongoDB before handling any requests
connectDB();

// Parse incoming JSON request bodies
app.use(express.json());

// Mount all auth related routes under /auth
app.use("/auth", authRoutes);

// Sample protected route to test JWT middleware
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    userId: req.userId, // userId comes from verified JWT
  });
});

// Start server on port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
