import type { NextFunction, Request, Response } from "express";
import Course from "../models/course.js";

// Create a new course
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // get the fields
  try {
    const { title, description, category, lessons } = req.body;

    //take the fields and create a course

    const course = await Course.create({
      title,
      description,
      instructorId: req.user.userId,
      category,
      lessons,
    });

    res.status(201).json({ message: "Course successfully created", course });
  } catch (error) {
    next(error);
  }
};

// Get all courses
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, page, limit } = req.query;

    // 1. Parse and sanitize pagination inputs
    const parsedPage = Math.max(1, parseInt(page as string) || 1);
    const parsedLimit = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 10),
    ); // Cap limit at 100 to prevent DB abuse
    const skip = (parsedPage - 1) * parsedLimit;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Course.countDocuments(filter),
    ]);
    res.json({
      courses,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Get a course by id
export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({
      course,
    });
  } catch (error) {
    next(error);
  }
};
