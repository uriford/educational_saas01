"use server";

import { SignupService } from "../services/signup.service";
import type { SignupFormData } from "../schemas/signup.schema";

export async function signupAction(
  data: SignupFormData,
) {
  try {
    return await SignupService.signup(data);
  } catch (error) {
    console.error("SIGNUP ACTION ERROR:", error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}
