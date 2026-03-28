import Doctor from "../models/doctorModel.js";
import DailyCall from "../models/dailyCallModel.js";
import Settings from "../models/settingsModel.js";
import TimeExtensionRequest from "../models/timeExtensionRequestModel.js";
import Warning from "../models/warningModel.js";
import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import { sendLeaveApplicationEmail } from "../utils/sendLeaveEmail.js";

// Add a new doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, clinicName, place, area, birthdate, phone, phone2, email } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Doctor name is required" });
    }

    const newDoctor = new Doctor({
      name,
      clinicName,
      place,
      area,
      birthdate: birthdate ? new Date(birthdate) : null,
      phone: phone || '',
      phone2: phone2 || '',
      email: email || '',
      createdBy: req.user._id, // MR's ID from JWT
    });

    await newDoctor.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error in addDoctor:", error);
    res.status(500).json({ message: "Failed to add doctor" });
  }
};

// Get all doctors (for dropdown) - employees can see all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .select("name clinicName place area birthdate phone phone2 email createdBy");

    res.json(doctors);
  } catch (error) {
    console.error("Error in getAllDoctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// Update doctor - employees can edit any doctor (same rights as admin)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, clinicName, place, area, birthdate, phone, phone2, email } = req.body;

    // Find doctor by ID (no ownership restriction)
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update fields
    if (name) doctor.name = name;
    if (clinicName !== undefined) doctor.clinicName = clinicName;
    if (place !== undefined) doctor.place = place;
    if (area !== undefined) doctor.area = area;
    if (birthdate !== undefined) doctor.birthdate = birthdate ? new Date(birthdate) : null;
    if (phone !== undefined) doctor.phone = phone || '';
    if (phone2 !== undefined) doctor.phone2 = phone2 || '';
    if (email !== undefined) doctor.email = email || '';

    await doctor.save();

    res.json({
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error in updateDoctor:", error);
    res.status(500).json({ message: "Failed to update doctor" });
  }
};

// Submit a daily call entry
export const submitDailyCall = async (req, res) => {
  try {
    const { doctor, date, remarks, products } = req.body;

    if (!doctor || !date) {
      return res.status(400).json({
        message: "Doctor and date are required",
      });
    }

    // Verify doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if date is within allowed time limit
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get time limit setting
    let setting = await Settings.findOne({ settingKey: "dailyCallTimeLimit" });
    if (!setting) {
      setting = await Settings.create({
        settingKey: "dailyCallTimeLimit",
        settingValue: 3,
        description: "Number of days employees can backdate daily call reports",
      });
    }
    
    const timeLimitDays = setting.settingValue;
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - (timeLimitDays - 1));
    
    // Check if date is within range OR has an approved extension request
    if (selectedDate < minDate || selectedDate > today) {
      console.log("Date outside normal range, checking for approved extension...");
      console.log("Selected date:", selectedDate.toISOString());
      console.log("Employee ID:", req.user._id);
      
      // Check for approved extension requests for this employee
      const approvedRequests = await TimeExtensionRequest.find({
        employee: req.user._id,
        status: "approved",
      });
      
      console.log("Found approved requests:", approvedRequests.length);
      
      // Check if any approved request matches the selected date
      let dateMatches = false;
      for (const request of approvedRequests) {
        const requestDate = new Date(request.requestedDate);
        requestDate.setHours(0, 0, 0, 0);
        console.log("Comparing with request date:", requestDate.toISOString(), "Status:", request.status);
        console.log("Selected time:", selectedDate.getTime(), "Request time:", requestDate.getTime());
        if (selectedDate.getTime() === requestDate.getTime()) {
          dateMatches = true;
          console.log("Date matches!");
          break;
        }
      }
      
      console.log("Final dateMatches:", dateMatches);
      
      if (!dateMatches) {
        return res.status(400).json({
          message: `You can only submit reports for the last ${timeLimitDays} days. Request an extension from admin if needed.`,
        });
      }
    }

    const newDailyCall = new DailyCall({
      mr: req.user._id,
      doctor,
      date: new Date(date),
      products: products || [],
      remarks,
    });

    await newDailyCall.save();

    // Populate doctor and products details for response
    await newDailyCall.populate("doctor", "name clinicName place area");
    await newDailyCall.populate("products", "productName brandName");

    res.status(201).json({
      message: "Daily call submitted successfully",
      dailyCall: newDailyCall,
    });
  } catch (error) {
    console.error("Error in submitDailyCall:", error);
    res.status(500).json({ message: "Failed to submit daily call" });
  }
};

// Get employee's own warnings
export const getMyWarnings = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const warnings = await Warning.find({ employee: employeeId })
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching employee warnings:", error);
    res.status(500).json({ message: "Failed to fetch warnings" });
  }
};

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const newLeave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    await newLeave.save();
    await newLeave.populate("employee", "name email");

    // Send email notification to admin
    let emailSent = false;
    try {
      const admins = await User.find({ role: "admin" });
      const adminEmail = admins.length > 0 ? admins[0] : { email: process.env.MAIL_USER };
      
      await sendLeaveApplicationEmail(
        adminEmail,
        { name: newLeave.employee.name, email: newLeave.employee.email },
        {
          leaveType: newLeave.leaveType,
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          reason: newLeave.reason,
        }
      );
      emailSent = true;
    } catch (emailError) {
      console.error("Error sending leave notification email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave: newLeave,
      emailSent,
    });
  } catch (error) {
    console.error("Error in applyLeave:", error);
    res.status(500).json({ message: "Failed to submit leave application" });
  }
};

// Get employee's own leave applications
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("respondedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Failed to fetch leave applications" });
  }
};

// Get count of responded leaves (approved/rejected)
export const getRespondedLeavesCount = async (req, res) => {
  try {
    const count = await Leave.countDocuments({
      employee: req.user._id,
      status: { $in: ["approved", "rejected"] },
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching responded leaves count:", error);
    res.status(500).json({ message: "Failed to fetch responded leaves count" });
  }
};
