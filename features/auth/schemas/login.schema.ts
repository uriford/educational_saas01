import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address.").trim(),

  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password is too long."),

  rememberMe: z.boolean(),
});