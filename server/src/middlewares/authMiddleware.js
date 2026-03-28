import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyAdminToken = async (req, res, next) => {
  // Debug: Log all cookies and headers
  //console.log("🍪 Received cookies:", req.cookies);
  //console.log("📋 Authorization header:", req.headers.authorization);

  const token =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies.jwt;

  //console.log("🔑 Extracted token:", token ? "Token exists" : "No token found");

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, token missing"
    });
  }

  //console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to verify role
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // CRITICAL: Check if user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    req.admin = user; // Attach full user object to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Verify MR token and role
export const verifyMRToken = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to check role
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user has MR/Employee role
    if (user.role !== "employee") {
      return res.status(403).json({ message: "Access denied. Employee role required." });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
