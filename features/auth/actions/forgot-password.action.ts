"use server";

import { PasswordResetService } from "../services/password-reset.service";
import type { ForgotPasswordFormData } from "../schemas/forgot-password.schema";

export async function forgotPasswordAction(
  data: ForgotPasswordFormData,
) {
  try {
    return await PasswordResetService.requestReset(data);
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
