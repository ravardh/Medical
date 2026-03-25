import mongoose from "mongoose";

const settingsSchema = mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
    },
    settingValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
