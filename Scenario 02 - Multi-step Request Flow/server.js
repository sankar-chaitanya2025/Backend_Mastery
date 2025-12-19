const express = require("express");
const app = express();
const { connectDB } = require("./db.js");
const PORT = 3000;

// try {
//   Step 1: Create user
//   Step 2: Create profile
//   Step 3: Send email
//   return success
// } catch {
//   rollback if needed
//   return error
// }

// app.post("/signup", (req, res) => {
//   const { email, password } = req.body;

// })

async function startServer() {
  await connectDB();

  app.listen(PORT, (req, res) => {
    console.log(`Server started at ${PORT}`);
  });
}

startServer();
