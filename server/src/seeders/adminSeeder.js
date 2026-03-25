import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Admin user data
const adminData = {
  name: "Admin User",
  email: "admin@meditechremedies.in",
  password: "Manish1974@", // Will be hashed
  phone: "9876543210",
  userType: "Admin", // Required in schema
  role: "admin",
  gender: "male", 
};


// Function to seed admin user
async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      await User.deleteMany();
      console.log("Old admin user(s) removed");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    // Save admin to database
    await admin.save();
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the seeder
seedAdmin();
