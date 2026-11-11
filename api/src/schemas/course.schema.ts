import * as z from "zod";

const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  videoUrl: z.string().url("Please provide a valid video URL"),
  order: z.number().int().positive("Order must be a positive integer"),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  category: z.enum(["programming", "design", "business"]),
  price: z.number().min(0, "Price cannot be negative").default(0),
  lessons: z.array(lessonSchema).optional(),
});

//Todo: Update course schema
