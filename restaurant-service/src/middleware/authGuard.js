// src/middleware/authGuard.js

const jwt = require("jsonwebtoken");

// Base auth middleware (reusing existing auth logic)
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Restaurant owner role guard
const isRestaurantOwner = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "restaurant") {
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Access denied. Restaurant owner privileges required",
        });
    }
  });
};

// Admin role guard
const isAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Admin privileges required" });
    }
  });
};

// Customer role guard
const isCustomer = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "customer") {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Customer privileges required" });
    }
  });
};

// Restaurant owner or admin guard (for shared access endpoints)
const isRestaurantOwnerOrAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (
      req.user &&
      (req.user.role === "restaurant" || req.user.role === "admin")
    ) {
      next();
    } else {
      res
        .status(403)
        .json({
          message:
            "Access denied. Restaurant owner or admin privileges required",
        });
    }
  });
};

module.exports = {
  auth,
  isRestaurantOwner,
  isAdmin,
  isCustomer,
  isRestaurantOwnerOrAdmin,
};
