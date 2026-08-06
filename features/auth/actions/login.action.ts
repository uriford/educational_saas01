"use server";

import { AuthService } from "../services/auth.service";
import type { LoginFormData } from "../types";

export async function loginAction(data: LoginFormData) {
  try {
    const response = await AuthService.login(data);

    return response;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}