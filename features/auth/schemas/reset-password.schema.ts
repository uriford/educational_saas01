import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must not exceed 100 characters."),

    confirmPassword: z
      .string()
      .min(8, "Please confirm your password.")
      .max(100, "Password must not exceed 100 characters."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type ResetPasswordFormData =
  z.infer<typeof resetPasswordSchema>;
