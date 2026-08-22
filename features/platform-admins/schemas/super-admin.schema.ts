import { z } from "zod";

export const createSuperAdminSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters."),

  lastName: z
    .string()
    .trim()
    .optional(),

  email: z
    .email("Invalid email address.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export type CreateSuperAdminInput =
  z.infer<typeof createSuperAdminSchema>;
