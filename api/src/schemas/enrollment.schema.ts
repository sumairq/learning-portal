import * as z from "zod";
import { objectId } from "./common.schema.js";

export const createEnrollmentSchema = z.object({
  courseId: objectId,
});
