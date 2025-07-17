import express from "express";
import {
  registrationController,
  loginController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
} from "../controller/userController.js";

const router = express.Router();

router.post("/registration", registrationController);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);

export default router;
