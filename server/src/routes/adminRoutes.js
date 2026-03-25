import express from "express";
import {
  addProduct,
  getAllProducts,
  // getProductById,
  updateProduct,
  deleteProduct,
  getStats,
  deleteSliderImage,
  addSliderImage,
  approveReview,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  generateReenableOTP,
  verifyReenableOTP,
  getAllDailyCalls,
  getAllDoctors,
  addDoctor,
  resendWelcomeEmail,
  updateDoctor,
  deleteDoctor,
  issueWarning,
  getEmployeeWarnings,
  getAllWarnings,
  updateWarningStatus,
  deleteWarning,
  resendWarningEmail,
  getAllLeaves,
  respondToLeave,
  getPendingLeavesCount,
  resendLeaveEmail,
} from "../controller/adminController.js";
import {
  getAllContacts,
  updateContactStatus,
  deleteContact,
  getAllReviews,
} from "../controller/publicController.js";
import {
  getAllSalarySlips,
  getSalarySlipById,
  createSalarySlip,
  generateSalarySlipPDF,
  deleteSalarySlip,
  getEmployeesForSalarySlip,
} from "../controller/salarySlipController.js";
import {
  getDailyCallTimeLimit,
  updateDailyCallTimeLimit,
  getAllTimeExtensionRequests,
  respondToTimeExtensionRequest,
  resendExtensionEmail,
} from "../controller/settingsController.js";
import {
  getAllExpenses,
  getExpenseById,
  adminUpdateExpense,
  adminDeleteExpense,
} from "../controller/expenseController.js";

import { verifyAdminToken } from "../middlewares/authMiddleware.js"; // Assuming token-based auth
import multer from "multer";

const router = express.Router();

const upload = multer();

// Dashboard Stats Route
router.get("/stats", verifyAdminToken, getStats);

// Product Management Routes (All protected)
router.post(
  "/products",
  verifyAdminToken,
  upload.array("images", 5),
  addProduct
);
router.get("/products", verifyAdminToken, getAllProducts);
//router.get('/products/:id', verifyAdminToken, getProductById);
router.put(
  "/products/:id",
  verifyAdminToken,
  upload.array("images", 5),
  updateProduct
);
router.delete("/products/:id", verifyAdminToken, deleteProduct);
router.get("/contacts", verifyAdminToken, getAllContacts);
// PATCH /api/contact/:id/status - Update status
router.patch("/:id/status", verifyAdminToken, updateContactStatus);
router.delete("/contact/:id", verifyAdminToken, deleteContact);
// DELETE /api/slider/:id - Delete an image
router.delete("/slider/:id", verifyAdminToken, deleteSliderImage);
// POST /api/slider - Add image
router.post("/addImage", verifyAdminToken, upload.single("imageUrl"), addSliderImage);

// approve review
router.patch("/review/:id/approve", verifyAdminToken, approveReview);
router.get("/reviews", verifyAdminToken, getAllReviews);

// User Management Routes
router.get("/users", verifyAdminToken, getAllUsers);
router.post("/users", verifyAdminToken, createUser);
router.put("/users/:id", verifyAdminToken, updateUser);
router.delete("/users/:id", verifyAdminToken, deleteUser);
router.patch("/users/:id/toggle-status", verifyAdminToken, toggleUserStatus);
router.post("/users/:id/resend-welcome", verifyAdminToken, resendWelcomeEmail);
router.post("/users/:id/generate-reenable-otp", verifyAdminToken, generateReenableOTP);
router.post("/users/:id/verify-reenable-otp", verifyAdminToken, verifyReenableOTP);

// Daily Call Reports (Admin view)
router.get("/daily-calls", verifyAdminToken, getAllDailyCalls);

// Doctor Management Routes (Admin view)
router.get("/doctors", verifyAdminToken, getAllDoctors);
router.post("/doctors", verifyAdminToken, addDoctor);
router.put("/doctors/:id", verifyAdminToken, updateDoctor);
router.delete("/doctors/:id", verifyAdminToken, deleteDoctor);

// Salary Slip Management Routes
router.get("/salary-slips", verifyAdminToken, getAllSalarySlips);
router.get("/salary-slips/employees", verifyAdminToken, getEmployeesForSalarySlip);
router.post("/salary-slips", verifyAdminToken, createSalarySlip);
router.get("/salary-slips/:id", verifyAdminToken, getSalarySlipById);
router.get("/salary-slips/:id/pdf", verifyAdminToken, generateSalarySlipPDF);
router.delete("/salary-slips/:id", verifyAdminToken, deleteSalarySlip);

// Settings Routes
router.get("/settings/daily-call-time-limit", verifyAdminToken, getDailyCallTimeLimit);
router.put("/settings/daily-call-time-limit", verifyAdminToken, updateDailyCallTimeLimit);

// Time Extension Requests Routes
router.get("/time-extension-requests", verifyAdminToken, getAllTimeExtensionRequests);
router.patch("/time-extension-requests/:id", verifyAdminToken, respondToTimeExtensionRequest);
router.post("/time-extension-requests/:id/resend-email", verifyAdminToken, resendExtensionEmail);

// Warning Management Routes
router.post("/warnings/:employeeId", verifyAdminToken, issueWarning);
router.get("/warnings", verifyAdminToken, getAllWarnings);
router.get("/warnings/:employeeId", verifyAdminToken, getEmployeeWarnings);
router.patch("/warnings/:warningId/status", verifyAdminToken, updateWarningStatus);
router.delete("/warnings/:warningId", verifyAdminToken, deleteWarning);
router.post("/warnings/:warningId/resend-email", verifyAdminToken, resendWarningEmail);

// Leave Management Routes
router.get("/leaves", verifyAdminToken, getAllLeaves);
router.get("/leaves/pending/count", verifyAdminToken, getPendingLeavesCount);
router.patch("/leaves/:leaveId", verifyAdminToken, respondToLeave);
router.post("/leaves/:leaveId/resend-email", verifyAdminToken, resendLeaveEmail);

// Expense Management Routes
router.get("/expenses", verifyAdminToken, getAllExpenses);
router.get("/expenses/:id", verifyAdminToken, getExpenseById);
router.put("/expenses/:id", verifyAdminToken, adminUpdateExpense);
router.delete("/expenses/:id", verifyAdminToken, adminDeleteExpense);

export default router;