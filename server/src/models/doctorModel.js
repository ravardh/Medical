import mongoose from "mongoose";

const doctorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    clinicName: {
      type: String,
      default: '',
    },
    place: {
      type: String,
      default: '',
    },
    area: {
      type: String,
      default: '',
    },
    birthdate: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      default: '',
    },
    phone2: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
