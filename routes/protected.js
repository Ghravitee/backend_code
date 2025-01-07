import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();

// Route for patient dashboard
router.get("/dashboard", auth(["user"]), (req, res) => {
  try {
    // Assuming user details are added to `req.user` by the `authenticate` middleware
    const user = req.user; // This should include fullname, email, etc.
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      fullname: user.fullname,
      email: user.email,
      username: user.username,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      weight: user.weight,
      height: user.height,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
