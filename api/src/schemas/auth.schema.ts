import * as z from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be more than 72 characters"),
});

//Todo: Login user schema

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string(),
});
