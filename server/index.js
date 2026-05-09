import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./src/routes/authRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
import publicRouter from "./src/routes/publicRoutes.js";
import mrRouter from "./src/routes/mrRoutes.js";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import getCloudinary from "./src/config/cloudinary.js";
import { scheduleCleanup } from "./src/utils/cleanupOldRequests.js";
import { scheduleBirthdayReminders } from "./src/utils/sendBirthdayReminder.js";

const app = express();

//app.use(cors());

app.use(
  cors({
    origin: [
      "https://meditechremedies.in", 
      "https://www.meditechremedies.in",
      ...(process.env.NODE_ENV === "development" ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"] : [])
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// 🔍 Logging middleware for doctor requests
app.use((req, res, next) => {
  if (req.path.includes('/doctors')) {
    if (req.method === 'POST' || req.method === 'PUT') {
    }
  }
  next();
});

app.use("/auth", authRouter);

app.use("/admin", adminRouter);

app.use("/public", publicRouter);

app.use("/mr", mrRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Server Connected",
    status: "OK"
  });
});

// Cookie test endpoint for debugging
app.get("/test-cookie", (req, res) => {
  res.cookie("testCookie", "testValue", {
    httpOnly: false, // Allow JS access for testing
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 5 * 60 * 1000, // 5 minutes
  });
  
  res.json({
    message: "Test cookie set",
    receivedCookies: req.cookies,
    environment: process.env.NODE_ENV
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    status,
    message,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  process.stdout.write(`✅ Server is running on port ${PORT}\n`);

  connectDB();
  
  // Test Cloudinary configuration
  try {
    const cloudinary = getCloudinary();
    process.stdout.write("✅ Cloudinary configured successfully\n");
  } catch (error) {
    process.stderr.write(`❌ Cloudinary configuration error: ${error.message}\n`);
  }
  
  // Start automatic cleanup of old extension requests
  scheduleCleanup();
  process.stdout.write("✅ Automatic cleanup scheduler started (runs every 24 hours)\n");

  // Start birthday reminder scheduler
  scheduleBirthdayReminders();
  process.stdout.write("✅ Birthday reminder scheduler started\n");

});
