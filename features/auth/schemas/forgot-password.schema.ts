import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .email("Invalid email address.")
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;
