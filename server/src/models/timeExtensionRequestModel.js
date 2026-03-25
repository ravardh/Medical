import mongoose from "mongoose";

const timeExtensionRequestSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isWarning: {
      type: Boolean,
      default: false,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
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

const TimeExtensionRequest = mongoose.model("TimeExtensionRequest", timeExtensionRequestSchema);
export default TimeExtensionRequest;
