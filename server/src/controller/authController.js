import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { genToken } from "../config/auth.js";

export const LoginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //console.log(email, password);
    // Simple validation
    if (!email || !password) {
      const err = new Error("All fields are required.");
      err.status = 400;
      return next(err);
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    //console.log("user", user);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // Check if user is active
    if (user.isActive === false) {
      const err = new Error("Your account has been disabled. Please contact administrator.");
      err.status = 403;
      return next(err);
    }

    // Check if the password is correct
    const ispasswordCorrect = await bcrypt.compare(password, user.password);
    //console.log("Password",ispasswordCorrect);
    if (!ispasswordCorrect) {
      const err = new Error("Invalid credentials.");
      err.status = 401;
      return next(err);
    }

    // Generate a JWT token
    const token = genToken(res, user._id);
    console.log("User logged in successfully:", user.email);
    console.log("User role:", user.role);
    console.log("User data being sent:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        userType: user.userType,
      },
      token
    });
  } catch (err) {
    console.log(err);
    const error = new Error("Server Error");
    error.status = 500;
    return next(error);
  }
};

export const RegisterController = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      const err = new Error("All required fields must be provided");
      err.status = 400;
      return next(err);
    }
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const err = new Error("Email already registered");
      err.status = 400;
      return next(err);
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      const err = new Error("Phone number already registered");
      err.status = 400;
      return next(err);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: "Admin", // Set userType for admin registration
      role: role || "admin", // Default role is admin for admin registration
      gender: gender || "male", // Default gender if not specified
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    const error = new Error("Server Error");
    error.status = 500;
    return next(error);
  }
};

export const LogoutController = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};
