import express from "express";
import { check } from "express-validator";
import {
  createHealthStats,
  getHealthStatsByDate,
  getHealthStatsByRange,
  updateHealthStats,
  getAllHealthStats,
  getAllUserHealthStats,
} from "../controllers/healthStatsController.js";
import { auth } from "../middleware/auth.js";
import { isAuthorized } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";

const router = express.Router();

// Validation rules for creating/updating health stats
const healthStatsValidationRules = [
  check("date")
    .isISO8601()
    .toDate()
    .withMessage("Date must be in ISO8601 format (YYYY-MM-DD)"),
  check("vitals.bodyTemperature")
    .optional()
    .isFloat({ min: 35, max: 42 })
    .withMessage("Body Temperature must be between 35°C and 42°C"),
  check("vitals.pulseRate")
    .optional()
    .isInt({ min: 40, max: 200 })
    .withMessage("Pulse Rate must be between 40 and 200 beats per minute"),
  check("vitals.respirationRate")
    .optional()
    .isInt({ min: 10, max: 50 })
    .withMessage(
      "Respiration Rate must be between 10 and 50 breaths per minute"
    ),
  check("vitals.bloodPressure")
    .optional()
    .matches(/^\d{2,3}\/\d{2,3}$/)
    .withMessage('Blood Pressure must be in the format "120/80"'),
  check("vitals.bloodOxygen")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Blood Oxygen level must be between 0% and 100%"),
  check("vitals.weight")
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage("Weight must be between 0 and 500 kg"),
  check("vitals.bloodGlucoseLevel")
    .optional()
    .isFloat({ min: 0, max: 30 })
    .withMessage("Blood Glucose Level must be between 0 and 30 mmol/L"),
  check("exerciseLog.walking")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Walking distance must be a positive number"),
  check("exerciseLog.jogging")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Jogging distance must be a positive number"),
  check("exerciseLog.running")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Running distance must be a positive number"),
  check("exerciseLog.cycling")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cycling distance must be a positive number"),
  check("exerciseLog.ropeSkipping")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Rope Skipping counts must be a non-negative integer"),
  check("exerciseLog.yoga")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Yoga duration must be a non-negative integer (minutes)"),
  check("exerciseLog.dance")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Dance duration must be a non-negative integer (minutes)"),
];

router.post(
  "/healthstats",
  auth(["user"]), // Ensure the user is authenticated
  healthStatsValidationRules,
  validateRequest,
  createHealthStats
);

router.get(
  "/healthstats/:date",
  auth(["user"]), // Ensure the user is authenticated
  getHealthStatsByDate
);

router.get(
  "/range/:start/:end",
  auth(["user"]), // Ensure the user is authenticated
  getHealthStatsByRange
);

router.put(
  "/:date",
  auth(["user"]), // Ensure the user is authenticated
  healthStatsValidationRules,
  validateRequest,
  updateHealthStats
);

router.get("/all-healthstats", getAllUserHealthStats); // Admin route to fetch all users' health stats

// Sample route to fetch health stats, only accessible for data analysts with the correct code
router.get("/healthstats", isAuthorized, getAllHealthStats);

export default router;
