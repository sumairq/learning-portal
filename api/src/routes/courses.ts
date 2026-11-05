import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { createCourse } from "../controllers/courseController.js";

const router = express.Router();

//Post  /api/auth/register
router.post('/', protect, restrictTo('instructor'), createCourse);

export default router;