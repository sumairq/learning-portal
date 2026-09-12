import express from "express";
import { registerUser } from "../controllers/authController.js";
const router = express.Router();




//Post  /api/auth/register
router.post('/register', registerUser );

// POST  /api/auth/login

export default router