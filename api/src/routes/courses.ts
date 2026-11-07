import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { createCourse, getCourses } from "../controllers/courseController.js";

const router = express.Router();

//Post  /api/auth/register
router.post('/', protect, restrictTo('instructor'), createCourse);
//Get /api/courses/
router.get('/', getCourses);

export default router;