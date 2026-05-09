import Expense from "../models/expenseModel.js";
import DailyCall from "../models/dailyCallModel.js";
import Leave from "../models/leaveModel.js";
import Doctor from "../models/doctorModel.js";

// Helper function to get days in month
const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

// Helper function to calculate summary
const calculateSummary = (entries) => {
  const summary = {
    atHQ: 0,
    atExStn: 0,
    atOutStn: 0,
    leaveTaken: 0,
    holiday: 0,
    total: 0,
  };

  entries.forEach((entry) => {
    if (entry.isLeave) {
      summary.leaveTaken += 1;
    } else if (entry.isHoliday) {
      summary.holiday += 1;
    } else if (entry.place) {
      if (entry.dailyAllowance.hq > 0) summary.atHQ += 1;
      if (entry.dailyAllowance.ex > 0) summary.atExStn += 1;
      if (entry.dailyAllowance.os > 0) summary.atOutStn += 1;
    }
  });

  summary.total = entries.length;
  return summary;
};

// Helper function to calculate totals
const calculateTotals = (entries) => {
  const totals = {
    fare: 0,
    hq: 0,
    ex: 0,
    os: 0,
    otherExpenses: 0,
    grandTotal: 0,
  };

  entries.forEach((entry) => {
    totals.fare += entry.fare || 0;
    totals.hq += entry.dailyAllowance?.hq || 0;
    totals.ex += entry.dailyAllowance?.ex || 0;
    totals.os += entry.dailyAllowance?.os || 0;
    totals.otherExpenses += entry.otherExpenses || 0;
  });

  totals.grandTotal = totals.fare + totals.hq + totals.ex + totals.os + totals.otherExpenses;

  return totals;
};

// Get or create expense for employee
export const getOrCreateExpense = async (req, res) => {
  try {
    const { month, year } = req.params;
    const employeeId = req.user._id;

    // Find existing expense
    let expense = await Expense.findOne({
      employee: employeeId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate("employee", "name email");

    // If not found, create a new one with auto-populated data
    if (!expense) {
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      const entries = [];

      // Get daily calls for this month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const dailyCalls = await DailyCall.find({
        mr: employeeId,
        date: { $gte: startDate, $lte: endDate },
      }).populate("doctor", "city");

      // Get approved leaves for this month
      const leaves = await Leave.find({
        employee: employeeId,
        status: "approved",
        $or: [
          {
            startDate: { $gte: startDate, $lte: endDate },
          },
          {
            endDate: { $gte: startDate, $lte: endDate },
          },
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      });

      // Create a map of dates to places from daily calls
      const dailyCallMap = {};
      dailyCalls.forEach((call) => {
        const date = new Date(call.date).getDate();
        if (!dailyCallMap[date]) {
          dailyCallMap[date] = [];
        }
        if (call.doctor && call.doctor.city) {
          dailyCallMap[date].push(call.doctor.city);
        }
      });

      // Create a set of leave dates
      const leaveDates = new Set();
      leaves.forEach((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        for (
          let d = new Date(start);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          if (
            d.getMonth() === parseInt(month) - 1 &&
            d.getFullYear() === parseInt(year)
          ) {
            leaveDates.add(d.getDate());
          }
        }
      });

      // Create entries for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const entry = {
          date: day,
          place: "",
          fare: 0,
          dailyAllowance: { hq: 0, ex: 0, os: 0 },
          otherExpenses: 0,
          remark: "",
          isLeave: leaveDates.has(day),
          isHoliday: false,
        };

        // Auto-populate place from daily calls (priority: leave > daily call)
        if (leaveDates.has(day)) {
          entry.place = "Leave";
        } else if (dailyCallMap[day] && dailyCallMap[day].length > 0) {
          // Join multiple cities if visited multiple doctors
          entry.place = [...new Set(dailyCallMap[day])].join(", ");
        }

        entries.push(entry);
      }

      expense = new Expense({
        employee: employeeId,
        month: parseInt(month),
        year: parseInt(year),
        entries,
        summary: calculateSummary(entries),
        totals: calculateTotals(entries),
      });

      await expense.save();
      await expense.populate("employee", "name email");
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching/creating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { entries, dateOfPosting, status } = req.body;
    const employeeId = req.user._id;

    const expense = await Expense.findOne({
      _id: id,
      employee: employeeId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Don't allow editing if already approved
    if (expense.status === "approved" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Cannot edit approved expense" });
    }

    if (entries) expense.entries = entries;
    if (dateOfPosting) expense.dateOfPosting = dateOfPosting;
    // Employees may only set status to draft, rejected (auto-save) or submitted
    const allowedStatuses = ["draft", "rejected", "submitted"];
    if (status && allowedStatuses.includes(status)) expense.status = status;

    // Recalculate summary and totals
    expense.summary = calculateSummary(expense.entries);
    expense.totals = calculateTotals(expense.entries);

    await expense.save();
    await expense.populate("employee", "name email");

    res.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all expenses for employee
export const getMyExpenses = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const expenses = await Expense.find({ employee: employeeId })
      .sort({ year: -1, month: -1 })
      .populate("employee", "name email")
      .populate("reviewedBy", "name");

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const { status, month, year, employee } = req.query;
    const filter = {};

    // Never show drafts to admin — only submitted/approved/rejected
    if (status && status !== "draft") {
      filter.status = status;
    } else {
      filter.status = { $in: ["submitted", "approved", "rejected"] };
    }

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employee) filter.employee = employee;

    const expenses = await Expense.find(filter)
      .sort({ dateOfPosting: -1, updatedAt: -1, createdAt: -1 })
      .populate("employee", "name email employeeId")
      .populate("reviewedBy", "name");

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching all expenses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .populate("employee", "name email employeeId")
      .populate("reviewedBy", "name");

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Update expense
export const adminUpdateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { entries, status, adminNote, dateOfPosting } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (entries) expense.entries = entries;
    if (status) {
      expense.status = status;
      if (status === "approved" || status === "rejected") {
        expense.reviewedBy = req.admin?.id || req.user?._id;
        expense.reviewedAt = new Date();
      }
    }
    if (adminNote !== undefined) expense.adminNote = adminNote;
    if (dateOfPosting) expense.dateOfPosting = dateOfPosting;

    // Recalculate summary and totals
    expense.summary = calculateSummary(expense.entries);
    expense.totals = calculateTotals(expense.entries);

    await expense.save();
    await expense.populate("employee", "name email employeeId");
    await expense.populate("reviewedBy", "name");

    res.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const expense = await Expense.findOne({
      _id: id,
      employee: employeeId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Don't allow deleting if already submitted or approved
    if (expense.status !== "draft") {
      return res
        .status(403)
        .json({ message: "Cannot delete submitted expense" });
    }

    await Expense.deleteOne({ _id: id });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Delete expense
export const adminDeleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.deleteOne({ _id: id });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sync places from daily calls
export const syncPlacesFromDailyCalls = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const expense = await Expense.findOne({
      _id: id,
      employee: employeeId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Get daily calls for this month
    const startDate = new Date(expense.year, expense.month - 1, 1);
    const endDate = new Date(expense.year, expense.month, 0, 23, 59, 59);

    const dailyCalls = await DailyCall.find({
      mr: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("doctor").lean();

    // Get approved leaves for this month
    const leaves = await Leave.find({
      employee: employeeId,
      status: "approved",
      $or: [
        {
          startDate: { $gte: startDate, $lte: endDate },
        },
        {
          endDate: { $gte: startDate, $lte: endDate },
        },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ],
    });

    // Create a map of dates to places from daily calls
    const dailyCallMap = {};
    dailyCalls.forEach((call) => {
      const date = new Date(call.date).getDate();
      if (!dailyCallMap[date]) {
        dailyCallMap[date] = [];
      }
      // Support both 'place' (new) and 'city' (legacy field name in MongoDB)
      const location = (call.doctor && (call.doctor.place || call.doctor.city)) || null;
      if (location) {
        dailyCallMap[date].push(location);
      }
    });

    // Create a set of leave dates
    const leaveDates = new Set();
    leaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        if (
          d.getMonth() === expense.month - 1 &&
          d.getFullYear() === expense.year
        ) {
          leaveDates.add(d.getDate());
        }
      }
    });

    // Update entries with synced data
    expense.entries.forEach((entry) => {
      const day = entry.date;
      
      // Update leave status
      entry.isLeave = leaveDates.has(day);
      
      // Update place: priority is leave > daily call > keep existing
      if (leaveDates.has(day)) {
        entry.place = "Leave";
      } else if (dailyCallMap[day] && dailyCallMap[day].length > 0) {
        // Always sync place from call reports
        entry.place = [...new Set(dailyCallMap[day])].join(", ");
      }
    });

    // Recalculate summary and totals
    expense.summary = calculateSummary(expense.entries);
    expense.totals = calculateTotals(expense.entries);

    await expense.save();
    await expense.populate("employee", "name email");

    res.json(expense);
  } catch (error) {
    console.error("Error syncing places:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
