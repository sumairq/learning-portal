import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import {
  createCourse,
  getCourses,
  getCourse,
} from "../controllers/courseController.js";
import { createCourseSchema } from "../schemas/course.schema.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

//Post  /api/auth/register
router.post(
  "/",
  protect,
  restrictTo("instructor"),
  validate(createCourseSchema),
  createCourse,
);
//Get /api/courses/
router.get("/", getCourses);
//Get /api/courses/:id
router.get("/:id", getCourse);

export default router;
