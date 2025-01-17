import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post(
  "/users",
  [
    body("fullname")
      .notEmpty()
      .withMessage("Full name is required")
      .isAlpha("en-US")
      .withMessage("Full name must contain only letters"),

    body("username")
      .notEmpty()
      .isLength({ min: 3, max: 15 })
      .withMessage("Username must be between 3 and 30 characters"),

    body("password")
      .notEmpty()
      .isLength({ min: 6, max: 10 })
      .withMessage("Password must be between 6 and 10 characters"),

    body("confirmPassword")
      .notEmpty()
      .isLength({ min: 6, max: 10 })
      .withMessage("Password must be identical"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),

    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isDate()
      .withMessage("invalid date of birth"),

    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isIn(["Male", "Female"])
      .withMessage("invalid gender"),

    body("weight")
      .notEmpty()
      .withMessage("weight is required")
      .isFloat({ gt: 0 })
      .withMessage("Weight must be a positive number"),

    body("height")
      .notEmpty()
      .withMessage("Height is required")
      .isFloat({ gt: 0 })
      .withMessage("Height must be a positive number"),
  ],
  validateRequest,
  userController.createUser
);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

router.get("/users", userController.getUsers); // Get all users
router.get("/users/:id", userController.getUsersById); // Get a user by ID
router.put("/users/:id", userController.updateUser); // Update a user b yID
router.delete("/patients/:id", userController.deleteUser); // Delete a patient

export default router;
