import { z } from "zod";

export const signupSchema = z
  .object({
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

    phone: z
      .string()
      .trim()
      .min(7, "Phone number is required."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),

    confirmPassword: z
      .string()
      .min(8, "Please confirm your password."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type SignupFormData = z.infer<typeof signupSchema>;
