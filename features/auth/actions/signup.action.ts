"use server";

import { SignupService } from "../services/signup.service";
import { signupSchema } from "../schemas/signup.schema";

export async function signupAction(
  data: unknown,
) {
  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid signup data.",
    };
  }

  try {
    return await SignupService.signup(parsed.data);
  } catch (error) {
    console.error("SIGNUP ACTION ERROR:", error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}
