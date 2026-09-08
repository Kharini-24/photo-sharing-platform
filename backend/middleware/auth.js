const jwt = require("jsonwebtoken");

// WHAT IS MIDDLEWARE? It's a function that runs BEFORE your route's main logic.
// Think of it like a security guard checking your ID before you enter a building.

// 1) "protect" -- checks: is this person logged in at all?
function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify checks the token was really issued by us and hasn't expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (id, role) to the request for later use
    next(); // move on to the actual route
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// 2) "adminOnly" -- checks: is this logged-in person specifically an Admin?
// This directly implements the requirement doc's rule:
// "Team Members must not be able to publish galleries or manage other users' photos."
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only Admins can perform this action." });
  }
  next();
}

module.exports = { protect, adminOnly };
