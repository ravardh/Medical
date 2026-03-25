import Settings from "../models/settingsModel.js";
import TimeExtensionRequest from "../models/timeExtensionRequestModel.js";
import { sendExtensionResponseEmail } from "../utils/sendExtensionResponseEmail.js";

// Get daily call time limit setting
export const getDailyCallTimeLimit = async (req, res) => {
  try {
    let setting = await Settings.findOne({ settingKey: "dailyCallTimeLimit" });
    
    if (!setting) {
      // Create default setting if doesn't exist
      setting = await Settings.create({
        settingKey: "dailyCallTimeLimit",
        settingValue: 3,
        description: "Number of days employees can backdate daily call reports",
      });
    }
    
    res.json({ timeLimit: setting.settingValue });
  } catch (error) {
    console.error("Error fetching time limit:", error);
    res.status(500).json({ message: "Failed to fetch time limit setting" });
  }
};

// Update daily call time limit setting (Admin only)
export const updateDailyCallTimeLimit = async (req, res) => {
  try {
    const { timeLimit } = req.body;
    
    if (!timeLimit || timeLimit < 1 || timeLimit > 30) {
      return res.status(400).json({ message: "Time limit must be between 1 and 30 days" });
    }
    
    let setting = await Settings.findOne({ settingKey: "dailyCallTimeLimit" });
    
    if (!setting) {
      setting = await Settings.create({
        settingKey: "dailyCallTimeLimit",
        settingValue: timeLimit,
        description: "Number of days employees can backdate daily call reports",
      });
    } else {
      setting.settingValue = timeLimit;
      await setting.save();
    }
    
    res.json({ message: "Time limit updated successfully", timeLimit: setting.settingValue });
  } catch (error) {
    console.error("Error updating time limit:", error);
    res.status(500).json({ message: "Failed to update time limit" });
  }
};

// Get all time extension requests (Admin)
export const getAllTimeExtensionRequests = async (req, res) => {
  try {
    const requests = await TimeExtensionRequest.find()
      .populate("employee", "name email")
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching extension requests:", error);
    res.status(500).json({ message: "Failed to fetch extension requests" });
  }
};

// Approve/Reject time extension request (Admin)
export const respondToTimeExtensionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, isWarning } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const request = await TimeExtensionRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request has already been processed" });
    }
    
    request.status = status;
    request.respondedBy = req.admin.id;
    request.respondedAt = new Date();
    request.adminNote = adminNote || "";
    request.isWarning = isWarning || false;
    
    await request.save();
    
    const populatedRequest = await TimeExtensionRequest.findById(id)
      .populate("employee", "name email")
      .populate("respondedBy", "name");
    
    // Send email notification to employee
    if (status === "approved" && populatedRequest.employee && populatedRequest.employee.email) {
      const emailResult = await sendExtensionResponseEmail(
        populatedRequest.employee.email,
        populatedRequest.employee.name,
        populatedRequest.requestedDate,
        status,
        isWarning || false,
        adminNote || ""
      );
      
      // Update email status
      populatedRequest.emailSent = emailResult.success;
      populatedRequest.emailSentAt = emailResult.success ? new Date() : null;
      populatedRequest.emailError = emailResult.success ? null : emailResult.error;
      await populatedRequest.save();
      
      if (!emailResult.success) {
        console.error("Failed to send email to employee:", emailResult.error);
      }
    }
    
    res.json({ message: `Request ${status} successfully`, request: populatedRequest });
  } catch (error) {
    console.error("Error responding to extension request:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// Create time extension request (Employee)
export const createTimeExtensionRequest = async (req, res) => {
  try {
    const { requestedDate, reason } = req.body;
    
    if (!requestedDate || !reason) {
      return res.status(400).json({ message: "Date and reason are required" });
    }
    
    // Check if already has a pending request for this date
    const existingRequest = await TimeExtensionRequest.findOne({
      employee: req.user._id,
      requestedDate: new Date(requestedDate),
      status: "pending",
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this date" });
    }
    
    const newRequest = await TimeExtensionRequest.create({
      employee: req.user._id,
      requestedDate: new Date(requestedDate),
      reason,
    });
    
    const populatedRequest = await TimeExtensionRequest.findById(newRequest._id)
      .populate("employee", "name email");
    
    res.status(201).json({ message: "Extension request submitted successfully", request: populatedRequest });
  } catch (error) {
    console.error("Error creating extension request:", error);
    res.status(500).json({ message: "Failed to submit extension request" });
  }
};

// Get employee's own time extension requests
export const getMyTimeExtensionRequests = async (req, res) => {
  try {
    const requests = await TimeExtensionRequest.find({ employee: req.user._id })
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching extension requests:", error);
    res.status(500).json({ message: "Failed to fetch extension requests" });
  }
};

// Resend email for extension request (Admin only)
export const resendExtensionEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await TimeExtensionRequest.findById(id)
      .populate("employee", "name email")
      .populate("respondedBy", "name");
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (request.status !== "approved") {
      return res.status(400).json({ message: "Can only resend email for approved requests" });
    }
    
    if (!request.employee || !request.employee.email) {
      return res.status(400).json({ message: "Employee email not found" });
    }
    
    // Send email
    const emailResult = await sendExtensionResponseEmail(
      request.employee.email,
      request.employee.name,
      request.requestedDate,
      request.status,
      request.isWarning || false,
      request.adminNote || ""
    );
    
    // Update email status
    request.emailSent = emailResult.success;
    request.emailSentAt = emailResult.success ? new Date() : null;
    request.emailError = emailResult.success ? null : emailResult.error;
    await request.save();
    
    if (emailResult.success) {
      res.json({ message: "Email resent successfully", request });
    } else {
      res.status(500).json({ message: "Failed to send email", error: emailResult.error });
    }
  } catch (error) {
    console.error("Error resending email:", error);
    res.status(500).json({ message: "Failed to resend email" });
  }
};
