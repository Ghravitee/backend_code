// routes/codeValidationRoute.js

import express from "express";
import { validateCode } from "../controllers/codeValidationController.js";

const router = express.Router();

router.post("/validate-code", validateCode);

export default router;
