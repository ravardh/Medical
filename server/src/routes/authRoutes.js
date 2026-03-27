import express from "express";
import {
  LoginController,
  RegisterController,
  LogoutController,
} from "../controller/authController.js";

const router = express.Router();

// ⚠️ SECURITY: Registration endpoint disabled for production
// Admin accounts should be created via database seeder or secure admin panel
// To enable for development, uncomment the line below:
// router.post("/register", RegisterController);

router.post("/login", LoginController);
router.post("/logout", LogoutController);

export default router;
