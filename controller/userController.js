// logic // register // login

import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import secretKey from "../config/authConfig.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


export const registrationController = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    let existUser = await User.findOne({ email: email });
    if (existUser) {
      return res
        .status(200)
        .send({ message: "user Already present please login" });
    }

    let hashPassword = await bcryptjs.hash(password, 10);

    let user = new User({
      name,
      email,
      password: hashPassword,
      role: role || "user",
    });
    user = await user.save();
    res.status(201).send({
      message: "user Signup Successfully",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      message: "user Signup Error",
      error: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email: email }); // fixed missing await
    if (!user) {
      return res.status(404).send({ message: "user not exist" });
    }
    let matchPassword = await bcryptjs.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).send({ message: "password not matched .." });
    }
    let payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    let token = jwt.sign(payload, secretKey.secret_jwt, { expiresIn: "1h" });
    res.status(200).send({
      message: "user Login Successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      message: "user login Error",
      error: error.message,
    });
  }
};

// In-memory OTP store (for demo; use DB/Redis in production)
const otpStore = {};

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore[email] = { otp, expiresAt };

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shivbijoriya123@gmail.com",
        pass: "mlhb erlm icnt uwhj",
      },
    });

    // Email options
    const mailOptions = {
      from: 'shivbijoriya123@gmail.com',
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `<p>Hello,</p><p>Your OTP for password reset is: <b>${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('OTP email sent to:', email, 'Info:', info);
      res.status(200).json({ message: "OTP sent! Check your email." });
    } catch (err) {
      console.error('Error sending OTP email:', err);
      res.status(500).json({ message: "Failed to send OTP email.", error: err.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP email.", error: error.message });
  }
};

export const verifyOtpController = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: "No OTP requested for this email." });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }
  delete otpStore[email];
  // For demo, just return success. In real app, issue a token for password reset.
  return res.status(200).json({ message: "OTP verified. You can now reset your password." });
};

export const resetPasswordController = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password.", error: error.message });
  }
};
