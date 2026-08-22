import "server-only";

import bcrypt from "bcrypt";
import { AuthRepository } from "../repository/auth.repository";
import type { LoginFormData } from "../types";
import type { User } from "@prisma/client";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

type LoginResponse =
  | { success: true; message: string; user: User }
  | { success: false; message: string };

export class AuthService {
  static async login(data: LoginFormData): Promise<LoginResponse> {
    const identifier = data.email.trim().toLowerCase();

    const attempt = await AuthRepository.getLoginAttempt(identifier);
    const now = Date.now();

    if (attempt?.blockedUntil && attempt.blockedUntil.getTime() > now) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    if (
      attempt &&
      now - attempt.windowStart.getTime() >=
        AUTH_CONSTANTS.LOGIN_ATTEMPT_WINDOW_MS
    ) {
      await AuthRepository.resetLoginAttempt(identifier);
    }

    const user = await AuthRepository.findUserByEmail(identifier);

    if (!user || user.status !== "ACTIVE" || user.deletedAt) {
      await AuthRepository.recordLoginFailure(
        identifier,
        AUTH_CONSTANTS.LOGIN_ATTEMPT_MAX,
        AUTH_CONSTANTS.LOGIN_BLOCK_MS,
      );

      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      await AuthRepository.recordLoginFailure(
        identifier,
        AUTH_CONSTANTS.LOGIN_ATTEMPT_MAX,
        AUTH_CONSTANTS.LOGIN_BLOCK_MS,
      );

      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Demo mode: email verification temporarily bypassed.
    // Re-enable this check before production launch.

    await AuthRepository.resetLoginAttempt(identifier);
    await AuthRepository.updateLastLogin(user.id);

    return {
      success: true,
      message: "Login successful",
      user,
    };
  }
}
