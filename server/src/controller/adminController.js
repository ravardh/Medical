import Product from "../models/productModel.js";
import Slider from "../models/sliderModel.js";
import Contact from "../models/contactModel.js";
import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";
import DailyCall from "../models/dailyCallModel.js";
import Doctor from "../models/doctorModel.js";
import Warning from "../models/warningModel.js";
import Leave from "../models/leaveModel.js";
import getCloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";
import { sendWarningEmail } from "../utils/sendWarningEmail.js";
import { sendLeaveResponseEmail } from "../utils/sendLeaveEmail.js";

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Store OTP resend attempts for rate limiting
const resendAttempts = new Map();

// Clean up expired OTPs and old attempt records periodically
setInterval(() => {
  const now = Date.now();

  // Clean expired OTPs
  for (const [userId, otpData] of otpStore.entries()) {
    if (now > otpData.expiresAt) {
      otpStore.delete(userId);
      console.log(`[OTP Cleanup] Removed expired OTP for user ${userId}`);
    }
  }

  // Clean old resend attempt records (older than 1 hour)
  const oneHourAgo = now - 60 * 60 * 1000;
  for (const [userId, attemptData] of resendAttempts.entries()) {
    if (attemptData.lastSentAt < oneHourAgo) {
      resendAttempts.delete(userId);
      console.log(`[OTP Cleanup] Removed old resend attempts for user ${userId}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Helper to upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const cloudinary = getCloudinary();
  const results = await Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    })
  );
  return results;
};

// Add Product
export const addProduct = async (req, res) => {
  try {
    const { ...productFields } = req.body;
    const imageUrls = await uploadImagesToCloudinary(req.files || []);

    const newProduct = new Product({
      ...productFields,
      images: imageUrls,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = { ...req.body };

    // If new images are uploaded
    if (req.files && req.files.length > 0) {
      // Upload new images
      const newImages = await uploadImagesToCloudinary(req.files);
      updateData.images = newImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // console.log(products)
    res.json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ message: "Failed to get products" });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Get Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const totalSlider = await Slider.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalFeatured = await Product.countDocuments({ isfeatured: true });
    const totalUnApprovedReviews = await Review.countDocuments({
      isApproved: false,
    });
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    // console.log(totalProducts, totalSlider, totalUsers, totalContacts);
    res.json({
      totalProducts,
      totalSlider,
      totalContacts,
      totalFeatured,
      totalUnApprovedReviews,
      totalReviews,
      totalUsers,
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ message: "Failed to get stats" });
  }
};

// 1️⃣ Add a new slider image (with Cloudinary upload)
export const addSliderImage = async (req, res) => {
  try {
    const { imageName } = req.body;
    // Check for file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // Get cloudinary instance and upload to Cloudinary
    const cloudinary = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Slider" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Create new slider image in DB
    const newImage = await Slider.create({
      imageName,
      imageUrl: result.secure_url,
      public_id: result.public_id, // Save public_id for deletion
    });

    res.status(201).json({
      success: true,
      message: "Image added to slider",
      slider: newImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 2️⃣ Get all slider images
export const getAllSliderImages = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 }); // Latest first
    res.status(200).json({ success: true, sliders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
      error: error.message,
    });
  }
};

// 3️⃣ Delete slider image (from Cloudinary and DB)
export const deleteSliderImage = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    console.log(slider);

    // Delete from Cloudinary
    if (slider.public_id) {
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(slider.public_id);
    }

    // Delete from DB
    await slider.deleteOne();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Deletion failed",
      error: error.message,
    });
  }
};

// Approve the review
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    //if already approved make it false
    if (review.isApproved) {
      review.isApproved = false;
      await review.save();
      return res
        .status(200)
        .json({ success: true, message: "Review disapproved", review });
    } else {
      review.isApproved = true;
      await review.save();
      return res
        .status(200)
        .json({ success: true, message: "Review approved", review });
    }
  } catch (error) {
    console.error("Error in approveReview:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve review" });
  }
};

// USER MANAGEMENT FUNCTIONS

// Get all users (excluding admins)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Failed to get users" });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "Email already exists"
          : "Phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (employee account)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: "Employee",
      gender: gender || "male",
      role: "employee",
    });

    await newUser.save();

    // Send professional welcome email with credentials
    const mailResult = await sendWelcomeEmail({
      name,
      email,
      password, // Send the original password (not hashed) in email
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: mailResult.success
        ? "User created successfully and welcome email sent"
        : "User created, but failed to send welcome email",
      user: userResponse,
      mailStatus: mailResult.success ? "sent" : "failed",
      mailError: mailResult.error || null,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Resend welcome email for a user
export const resendWelcomeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ message: "A valid password is required to resend the welcome email." });
    }
    // Update user's password
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    // Send welcome email with new password
    const mailResult = await sendWelcomeEmail({
      name: user.name,
      email: user.email,
      password,
    });
    if (mailResult.success) {
      return res.json({ message: "Welcome email resent successfully with new password." });
    } else {
      return res.status(500).json({ message: mailResult.error || "Failed to resend welcome email." });
    }
  } catch (error) {
    console.error("Error in resendWelcomeEmail:", error);
    res.status(500).json({ message: "Failed to resend welcome email" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Don't allow changing role or userType
    delete updateData.role;
    delete updateData.userType;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Cannot delete admin users",
      });
    }

    // Note: We do NOT delete related data (doctors, daily calls)
    // This preserves all historical records created by this user
    // The createdBy field will still reference this user's ID for audit purposes
    
    await User.findByIdAndDelete(id);

    res.json({ 
      message: "Employee removed successfully. All their data has been preserved.",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent disabling admin users
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Cannot disable admin users",
      });
    }

    // If trying to enable a disabled account, require OTP
    if (!user.isActive) {
      return res.status(403).json({
        message: "OTP verification required to re-enable account",
        requireOTP: true,
      });
    }

    // Toggle the isActive status (disable only)
    user.isActive = false;
    await user.save();

    let emailStatus = null;
    let emailError = null;
    // Send account disabled email
    const { sendAccountDisabledEmail } = await import("../utils/sendAccountDisabledEmail.js");
    const result = await sendAccountDisabledEmail({ name: user.name, email: user.email });
    emailStatus = result.success ? "sent" : "failed";
    emailError = result.error || null;

    res.json({ 
      message: `User disabled successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
      emailStatus,
      emailError
    });
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    res.status(500).json({ message: "Failed to toggle user status" });
  }
};

// Generate and send OTP for account re-enable
export const generateReenableOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { isResend } = req.body; // Flag to indicate if this is a resend request

    // Use email from environment variable
    const adminEmail = process.env.MAIL_USER;

    if (!adminEmail) {
      return res.status(500).json({ message: "Admin email not configured in environment" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "Account is already active" });
    }

    // ══════════════════════════════════════════════════════════════
    // RATE LIMITING & SECURITY CHECKS (ONLY FOR RESENDS)
    // ══════════════════════════════════════════════════════════════

    const now = Date.now();

    if (isResend) {
      const attemptData = resendAttempts.get(id) || { attempts: [], lastSentAt: 0 };

      // 1. Check cooldown period (60 seconds between requests)
      const timeSinceLastSend = now - attemptData.lastSentAt;
      const cooldownPeriod = 60 * 1000; // 60 seconds

      if (timeSinceLastSend < cooldownPeriod) {
        const waitTime = Math.ceil((cooldownPeriod - timeSinceLastSend) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitTime} seconds before requesting a new OTP`,
          waitTime
        });
      }

      // 2. Clean up old attempts (older than 30 minutes)
      const thirtyMinutesAgo = now - 30 * 60 * 1000;
      attemptData.attempts = attemptData.attempts.filter(timestamp => timestamp > thirtyMinutesAgo);

      // 3. Check maximum attempts (5 attempts per 30 minutes)
      const maxAttemptsPerWindow = 5;
      if (attemptData.attempts.length >= maxAttemptsPerWindow) {
        return res.status(429).json({
          message: "Too many OTP requests. Please try again in 30 minutes.",
          tooManyAttempts: true
        });
      }
    }

    // ══════════════════════════════════════════════════════════════
    // GENERATE AND SEND OTP
    // ══════════════════════════════════════════════════════════════

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (10 minutes) and attempt count
    const otpData = {
      otp,
      userId: id,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes
      createdAt: now,
      attemptCount: (otpStore.get(id)?.attemptCount || 0) + 1
    };
    otpStore.set(id, otpData);

    // Update resend attempt tracking
    const attemptData = resendAttempts.get(id) || { attempts: [], lastSentAt: 0 };

    if (isResend) {
      attemptData.attempts.push(now);
    }
    attemptData.lastSentAt = now;
    resendAttempts.set(id, attemptData);

    // Send OTP to admin email
    const result = await sendOTPEmail(adminEmail, otp);

    if (!result.success) {
      // Rollback on email failure
      if (isResend) {
        const attemptData = resendAttempts.get(id);
        if (attemptData && attemptData.attempts.length > 0) {
          attemptData.attempts.pop();
          resendAttempts.set(id, attemptData);
        }
      } else {
        // For initial request, clear the tracking data
        resendAttempts.delete(id);
      }

      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        error: result.error
      });
    }

    // Log for security monitoring
    console.log(`[OTP] ${isResend ? 'Resent' : 'Generated'} for user ${id} (${user.email}). Attempt ${otpData.attemptCount}`);

    const maxAttemptsPerWindow = 5;
    const currentAttemptData = resendAttempts.get(id) || { attempts: [], lastSentAt: 0 };

    res.json({
      message: "OTP sent to your email successfully",
      expiresIn: 600, // seconds
      attemptsRemaining: maxAttemptsPerWindow - currentAttemptData.attempts.length
    });
  } catch (error) {
    console.error("Error in generateReenableOTP:", error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

// Verify OTP and re-enable account
export const verifyReenableOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(id);

    if (!otpData) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(id);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid - re-enable the user account
    user.isActive = true;
    await user.save();

    // Clean up OTP and resend attempt data after successful verification
    otpStore.delete(id);
    resendAttempts.delete(id);

    // Log successful verification
    console.log(`[OTP] Successfully verified for user ${id} (${user.email}). Account re-enabled.`);

    res.json({
      message: `${user.name}'s account has been re-enabled successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error in verifyReenableOTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// Get all daily calls (Admin view)
export const getAllDailyCalls = async (req, res) => {
  try {
    const dailyCalls = await DailyCall.find()
      .populate("mr", "name email")
      .populate("doctor", "name clinicName place")
      .populate("products", "productName brandName")
      .sort({ date: -1 }); // Newest first

    res.json(dailyCalls);
  } catch (error) {
    console.error("Error in getAllDailyCalls:", error);
    res.status(500).json({ message: "Failed to fetch daily calls" });
  }
};

// Get all doctors (Admin view)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// Add doctor (Admin)
export const addDoctor = async (req, res) => {
  try {
    const { name, clinicName, place, birthdate, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newDoctor = new Doctor({
      name,
      clinicName,
      place,
      birthdate: birthdate || null,
      phone: phone || '',
      email: email || '',
      createdBy: req.admin.id, // Use admin's ID
    });

    await newDoctor.save();
    const populatedDoctor = await Doctor.findById(newDoctor._id).populate(
      "createdBy",
      "name email"
    );
    
    res.status(201).json(populatedDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Failed to add doctor" });
  }
};

// Update doctor (Admin)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (typeof updateData.phone === 'undefined') updateData.phone = '';
    if (typeof updateData.email === 'undefined') updateData.email = '';
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true }).populate("createdBy", "name");
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Failed to update doctor" });
  }
};

// Delete doctor (Admin)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Failed to delete doctor" });
  }
};

// Issue warning to employee
export const issueWarning = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { title, description, severity, notes } = req.body;

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.role === "admin") {
      return res.status(403).json({ message: "Cannot issue warning to admin users" });
    }

    const warning = new Warning({
      employee: employeeId,
      issuedBy: req.admin.id,
      title,
      description,
      severity: severity || "medium",
      notes: notes || "",
    });

    await warning.save();

    // Populate employee and issuer details
    await warning.populate("employee", "name email");
    await warning.populate("issuedBy", "name email");

    // Send warning email
    let emailStatus = null;
    let emailError = null;
    try {
      const result = await sendWarningEmail(
        { name: employee.name, email: employee.email },
        { title, description, severity: severity || "medium", notes: notes || "" }
      );
      emailStatus = result.success ? "sent" : "failed";
      emailError = result.error || null;
      
      warning.emailSent = result.success;
      warning.emailSentAt = result.success ? new Date() : null;
      warning.emailError = emailError;
      await warning.save();
    } catch (error) {
      console.error("Error sending warning email:", error);
      emailStatus = "failed";
      emailError = error.message;
    }

    res.status(201).json({
      message: "Warning issued successfully",
      warning,
      emailStatus,
      emailError,
    });
  } catch (error) {
    console.error("Error issuing warning:", error);
    res.status(500).json({ message: "Failed to issue warning" });
  }
};

// Get all warnings for an employee
export const getEmployeeWarnings = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const warnings = await Warning.find({ employee: employeeId })
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching employee warnings:", error);
    res.status(500).json({ message: "Failed to fetch warnings" });
  }
};

// Get all warnings (admin view)
export const getAllWarnings = async (req, res) => {
  try {
    const warnings = await Warning.find()
      .populate("employee", "name email")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching all warnings:", error);
    res.status(500).json({ message: "Failed to fetch warnings" });
  }
};

// Update warning status
export const updateWarningStatus = async (req, res) => {
  try {
    const { warningId } = req.params;
    const { status, notes } = req.body;

    const warning = await Warning.findByIdAndUpdate(
      warningId,
      { status, notes },
      { new: true }
    )
      .populate("employee", "name email")
      .populate("issuedBy", "name email");

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    res.json({
      message: "Warning updated successfully",
      warning,
    });
  } catch (error) {
    console.error("Error updating warning:", error);
    res.status(500).json({ message: "Failed to update warning" });
  }
};

// Delete warning
export const deleteWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    const warning = await Warning.findByIdAndDelete(warningId);

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    res.json({ message: "Warning deleted successfully" });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({ message: "Failed to delete warning" });
  }
};

// Resend warning email
export const resendWarningEmail = async (req, res) => {
  try {
    const { warningId } = req.params;

    const warning = await Warning.findById(warningId)
      .populate("employee", "name email")
      .populate("issuedBy", "name email");

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    // Send warning email
    const result = await sendWarningEmail(
      { name: warning.employee.name, email: warning.employee.email },
      {
        title: warning.title,
        description: warning.description,
        severity: warning.severity,
        notes: warning.notes,
      }
    );

    // Update warning with email status
    warning.emailSent = result.success;
    warning.emailSentAt = result.success ? new Date() : null;
    warning.emailError = result.error || null;
    await warning.save();

    res.json({
      message: result.success
        ? "Warning email resent successfully"
        : "Failed to resend warning email",
      emailStatus: result.success ? "sent" : "failed",
      emailError: result.error,
    });
  } catch (error) {
    console.error("Error resending warning email:", error);
    res.status(500).json({ message: "Failed to resend warning email" });
  }
};

// Leave Management
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .populate("respondedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Failed to fetch leave applications" });
  }
};

export const getPendingLeavesCount = async (req, res) => {
  try {
    const count = await Leave.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching pending leaves count:", error);
    res.status(500).json({ message: "Failed to fetch pending leaves count" });
  }
};

export const resendLeaveEmail = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId)
      .populate("employee", "name email")
      .populate("respondedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    if (leave.status === "pending") {
      return res.status(400).json({ message: "Cannot resend email for pending leave" });
    }

    // Resend the response email to employee
    await sendLeaveResponseEmail(
      { name: leave.employee.name, email: leave.employee.email },
      {
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
      },
      {
        status: leave.status,
        adminNote: leave.adminNote,
      }
    );

    res.json({ message: "Email resent successfully" });
  } catch (error) {
    console.error("Error resending leave email:", error);
    res.status(500).json({ message: "Failed to resend email" });
  }
};

export const respondToLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const adminId = req.admin?.id || req.admin?._id || req.user?._id;

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      {
        status,
        adminNote,
        respondedBy: adminId,
        respondedAt: new Date(),
      },
      { new: true }
    )
      .populate("employee", "name email")
      .populate("respondedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    // Send email notification to employee
    let emailSent = false;
    try {
      await sendLeaveResponseEmail(
        { name: leave.employee.name, email: leave.employee.email },
        {
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
        },
        {
          status: leave.status,
          adminNote: leave.adminNote,
        }
      );
      emailSent = true;
    } catch (emailError) {
      console.error("Error sending leave response email:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Leave ${status} successfully`,
      leave,
      emailSent,
    });
  } catch (error) {
    console.error("Error responding to leave:", error);
    res.status(500).json({ message: "Failed to respond to leave application" });
  }
};
