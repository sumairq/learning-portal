import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { createEnrollment, getMyEnrollments} from "../controllers/enrollmentController.js";

const router = express.Router();

//Post  /api/enrollments/
router.post('/', protect, restrictTo('student'), createEnrollment);

//GET  /api/enrollments/my
router.get('/my', protect, getMyEnrollments);

export default router;