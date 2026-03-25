import { v2 as cloudinary } from "cloudinary";

// Initialize cloudinary configuration function
let isConfigured = false;

const configureCloudinary = () => {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    isConfigured = true;
  }
  return cloudinary;
};

// Export a function that ensures configuration before returning cloudinary
export default () => {
  return configureCloudinary();
};
