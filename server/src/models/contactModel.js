import mongoose, { Schema } from "mongoose";

const contactUsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "viewed"],
      default: "pending",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt will be added automatically
  }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
export default ContactUs;
