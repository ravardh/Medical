import mongoose from "mongoose";

const dailyCallSchema = mongoose.Schema(
  {
    mr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DailyCall = mongoose.model("DailyCall", dailyCallSchema);
export default DailyCall;
