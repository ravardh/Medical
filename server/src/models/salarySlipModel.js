import mongoose from "mongoose";

const salarySlipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Sales",
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    earnings: {
      basicSalary: {
        type: Number,
        required: true,
        default: 0,
      },
      houseRentAllowance: {
        type: Number,
        default: 0,
      },
      conveyanceAllowance: {
        type: Number,
        default: 0,
      },
      medicalAllowance: {
        type: Number,
        default: 0,
      },
      specialAllowance: {
        type: Number,
        default: 0,
      },
      otherAllowance: {
        type: Number,
        default: 0,
      },
    },
    deductions: {
      providentFund: {
        type: Number,
        default: 0,
      },
      professionalTax: {
        type: Number,
        default: 0,
      },
      incomeTax: {
        type: Number,
        default: 0,
      },
      loan: {
        type: Number,
        default: 0,
      },
      otherDeductions: {
        type: Number,
        default: 0,
      },
    },
    totalEarnings: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "UPI"],
      required: true,
      default: "Bank Transfer",
    },
    transferId: {
      type: String,
      required: true,
    },
    bankDetails: {
      bankName: {
        type: String,
        default: "",
      },
      accountNumber: {
        type: String,
        default: "",
      },
    },
    upiId: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const SalarySlip = mongoose.model("SalarySlip", salarySlipSchema);

export default SalarySlip;
