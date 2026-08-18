"use server";

import { PasswordResetService } from "../services/password-reset.service";
import { resetPasswordSchema } from "../schemas/reset-password.schema";

export async function resetPasswordAction(
  input: unknown,
) {
  const parsed =
    resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid password reset data.",
    };
  }

  try {
    return await PasswordResetService.resetPassword(
      parsed.data,
    );
  } catch (error) {
    console.error(
      "RESET PASSWORD ACTION ERROR:",
      error,
    );

    return {
      success: false as const,
      message:
        "Unable to reset your password. Please try again later.",
    };
  }
}
