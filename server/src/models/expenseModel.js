import mongoose from "mongoose";

const expenseEntrySchema = new mongoose.Schema({
  date: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  place: {
    type: String,
    default: "",
  },
  fare: {
    type: Number,
    default: 0,
  },
  dailyAllowance: {
    hq: { type: Number, default: 0 },       // H.O. (Head Office/Headquarters)
    ex: { type: Number, default: 0 },       // E.X (Ex Station)
    os: { type: Number, default: 0 },       // OS (Out Station)
  },
  otherExpenses: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    default: "",
  },
  isLeave: {
    type: Boolean,
    default: false,
  },
  isHoliday: {
    type: Boolean,
    default: false,
  },
});

const expenseSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    dateOfPosting: {
      type: Date,
    },
    entries: [expenseEntrySchema],
    summary: {
      atHQ: { type: Number, default: 0 },          // Days at headquarters
      atExStn: { type: Number, default: 0 },       // Days at ex station
      atOutStn: { type: Number, default: 0 },      // Days at out station
      leaveTaken: { type: Number, default: 0 },    // Leave days
      holiday: { type: Number, default: 0 },       // Holidays
      total: { type: Number, default: 0 },         // Total days
    },
    totals: {
      fare: { type: Number, default: 0 },
      hq: { type: Number, default: 0 },
      ex: { type: Number, default: 0 },
      os: { type: Number, default: 0 },
      otherExpenses: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for employee, month, and year
expenseSchema.index({ employee: 1, month: 1, year: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
