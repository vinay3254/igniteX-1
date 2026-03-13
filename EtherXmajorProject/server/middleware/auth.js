// middleware/auth.js — JWT verification (MongoDB ObjectId-aware)
const jwt      = require("jsonwebtoken");
const mongoose = require("mongoose");

// Returns true only for 24-char hex ObjectId strings (MongoDB IDs)
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;
}

// Hard-require auth
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Reject tokens from the old SQLite system (integer IDs are no longer valid)
    if (!isValidObjectId(decoded.id)) {
      return res.status(401).json({ error: "Session expired — please log in again" });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Soft auth — attach user if token present, continue either way
function softAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
      req.user = isValidObjectId(decoded.id) ? decoded : null;
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = { requireAuth, softAuth };
