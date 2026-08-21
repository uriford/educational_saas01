"use server";

import { PasswordResetService } from "../services/password-reset.service";
import { forgotPasswordSchema } from "../schemas/forgot-password.schema";

export async function forgotPasswordAction(
  data: unknown,
) {
  const parsed = forgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid email address.",
    };
  }

  try {
    return await PasswordResetService.requestReset(
      parsed.data,
    );
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ACTION ERROR:",
      error,
    );

    return {
      success: false as const,
      message:
        "Unable to process your request. Please try again later.",
    };
  }
}
