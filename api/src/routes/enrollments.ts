import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import {
  createEnrollment,
  getMyEnrollments,
  updateProgress,
} from "../controllers/enrollmentController.js";
import { validate } from "../middleware/validate.js";
import {
  createEnrollmentSchema,
  updateProgressSchema,
} from "../schemas/enrollment.schema.js";

const router = express.Router();

//Post  /api/enrollments/
router.post(
  "/",
  protect,
  restrictTo("student"),
  validate(createEnrollmentSchema),
  createEnrollment,
);

//GET  /api/enrollments/my
router.get("/my", protect, getMyEnrollments);

//PATCH  /api/enrollments/progress
router.patch(
  "/progress",
  protect,
  validate(updateProgressSchema),
  updateProgress,
);

export default router;
