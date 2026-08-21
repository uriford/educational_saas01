"use server";

import { AuthService } from "../services/auth.service";
import { loginSchema } from "../schemas/login.schema";

export async function loginAction(data: unknown) {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid login credentials.",
    };
  }

  try {
    const response = await AuthService.login(parsed.data);

    return response;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}