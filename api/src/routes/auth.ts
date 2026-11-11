import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginUserSchema, registerUserSchema } from "../schemas/auth.schema.js";
const router = express.Router();

//Post  /api/auth/register
router.post("/register", validate(registerUserSchema), registerUser);

// POST  /api/auth/login
router.post("/login", validate(loginUserSchema), loginUser);

export default router;
