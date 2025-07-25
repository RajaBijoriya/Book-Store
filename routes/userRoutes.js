import express from "express";
import {
  registrationController,
  loginController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
} from "../controller/userController.js";
import { verifyToken } from "../controller/bookController.js";

const router = express.Router();

router.post("/registration", registrationController);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);

router.get("/profile", verifyToken, async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const User = (await import("../models/userModel.js")).default;
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Exclude password from response
    const { password, ...userInfo } = user.toObject();
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user info", error: error.message });
  }
});

export default router;
