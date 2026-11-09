import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { createEnrollment} from "../controllers/enrollmentController.js";

const router = express.Router();

//Post  /api/enrollments/
router.post('/', protect, restrictTo('student'), createEnrollment);


export default router;