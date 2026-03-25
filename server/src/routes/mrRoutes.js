import express from "express";
import {
  addDoctor,
  getAllDoctors,
  updateDoctor,
  submitDailyCall,
  getMyWarnings,
  applyLeave,
  getMyLeaves,
  getRespondedLeavesCount,
} from "../controller/mrController.js";
import {
  getDailyCallTimeLimit,
  createTimeExtensionRequest,
  getMyTimeExtensionRequests,
} from "../controller/settingsController.js";
import {
  getOrCreateExpense,
  updateExpense,
  getMyExpenses,
  deleteExpense,
  syncPlacesFromDailyCalls,
} from "../controller/expenseController.js";
import { verifyMRToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Doctor Management Routes (MR only)
router.post("/doctors", verifyMRToken, addDoctor);
router.get("/doctors", verifyMRToken, getAllDoctors);
router.put("/doctors/:id", verifyMRToken, updateDoctor);

// Daily Call Report Routes (MR only)
router.post("/daily-call", verifyMRToken, submitDailyCall);

// Settings Routes
router.get("/settings/daily-call-time-limit", verifyMRToken, getDailyCallTimeLimit);

// Time Extension Requests Routes
router.post("/time-extension-requests", verifyMRToken, createTimeExtensionRequest);
router.get("/time-extension-requests", verifyMRToken, getMyTimeExtensionRequests);

// Warning Routes
router.get("/warnings", verifyMRToken, getMyWarnings);

// Leave Routes
router.post("/leaves", verifyMRToken, applyLeave);
router.get("/leaves", verifyMRToken, getMyLeaves);
router.get("/leaves/responded/count", verifyMRToken, getRespondedLeavesCount);

// Expense Routes
router.get("/expenses", verifyMRToken, getMyExpenses);
router.get("/expenses/:month/:year", verifyMRToken, getOrCreateExpense);
router.put("/expenses/:id", verifyMRToken, updateExpense);
router.post("/expenses/:id/sync", verifyMRToken, syncPlacesFromDailyCalls);
router.delete("/expenses/:id", verifyMRToken, deleteExpense);

export default router;
