import mongoose, { Schema } from "mongoose";

const sliderSchema = new Schema(
  {
    imageName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt will be added automatically
  }
);

const Slider = mongoose.model("Slider", sliderSchema);
export default Slider;
