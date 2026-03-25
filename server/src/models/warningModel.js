import mongoose from "mongoose";

const warningSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "resolved", "dismissed"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    emailError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Warning = mongoose.model("Warning", warningSchema);
export default Warning;
