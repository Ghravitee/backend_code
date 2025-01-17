import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createUser } from "../controllers/userController.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Helper to send emails
const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: message,
  });
};

// Request password reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate a reset token valid for 1 hour
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send reset token via email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click the following link to reset your password: ${resetURL}`;

    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({ message: "Password reset link sent to email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "Invalid token" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register route for users

router.post("/register", createUser);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // find the patient by username
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // check if the password given by the user matches with what is in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(404).json({ error: "Invalid credentials" });

    // Generate a jwt token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({ message: "Login successfully", userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
