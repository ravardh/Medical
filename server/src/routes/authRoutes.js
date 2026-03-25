import express from "express";
import {
  LoginController,
  RegisterController,
  LogoutController,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);
router.post("/logout", LogoutController);

export default router;
