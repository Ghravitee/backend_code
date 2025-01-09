import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createUser } from "../controllers/userController.js";

const router = express.Router();

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
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV,
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
    secure: process.env.NODE_ENV,
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
