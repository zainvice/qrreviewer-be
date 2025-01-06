const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authenticate Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); 
    if (!req.user) return res.status(401).json({ message: "User not found." });

    next(); // Pass to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Admin Check Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next(); // If admin, proceed
};

module.exports = { authenticate, isAdmin };
