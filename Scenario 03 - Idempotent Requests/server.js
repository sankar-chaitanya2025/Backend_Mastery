const express = require("express");
const connectDB = require("./db");
const paymentRoutes = require("./routes/payment");

const app = express();

/**
 * Middleware to parse JSON request bodies
 */
app.use(express.json());

/**
 * Connect to database before accepting requests
 */
connectDB();

/**
 * Routes
 */ console.log(paymentRoutes);

app.use("/api", paymentRoutes);

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
