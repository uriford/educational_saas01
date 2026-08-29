import { z } from "zod";

export const resetBranchCreationPasswordSchema =
  z
    .object({
      token: z.string().min(1),
      password: z
        .string()
        .min(
          16,
          "Password must be at least 16 characters.",
        ),
      confirmPassword: z.string(),
    })
    .refine(
      (data) =>
        data.password === data.confirmPassword,
      {
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      },
    );
