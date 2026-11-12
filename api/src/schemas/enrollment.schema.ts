import * as z from "zod";
import { objectId } from "./common.schema.js";

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

export const createEnrollmentSchema = z.object({
  courseId: objectId,
});

export const updateProgressSchema = z.object({
  courseId: objectId,
  lessonId: objectId,
});
