const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Handle both old tokens (with 'id') and new tokens (with '_id')
      const userId = decoded._id || decoded.id;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

const ownerMiddleware = (req, res, next) => {
  console.log("Checking owner access for user:", req.user ? {
    id: req.user._id,
    role: req.user.role,
    currentRole: req.user.currentRole
  } : "No user");

  if (req.user && (req.user.currentRole === "owner" || req.user.role === "admin")) {
    next();
  } else {
    console.log("Access denied in ownerMiddleware");
    res.status(403);
    throw new Error("You must be in Owner mode to perform this action. Switch to Owner mode in Settings.");
  }
};

module.exports = { authMiddleware, adminMiddleware, ownerMiddleware };