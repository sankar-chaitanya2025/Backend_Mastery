const jwt = require("jsonwebtoken");

const JWT_SECRET = "ILOVE100XDEVS";

async function authMiddleware(req, res, next) {
  // Read Authorization header
  const authHeader = req.headers.authorization;

  // If header is missing or not Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authorization token missing",
    });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT signature and expiry
    const payload = jwt.verify(token, JWT_SECRET);

    // Attach userId to request for next handlers
    req.userId = payload.userId;

    // Move to next middleware / controller
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
}

module.exports = authMiddleware;
