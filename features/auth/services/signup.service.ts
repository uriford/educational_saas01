import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { SignupRepository } from "../repository/signup.repository";
import type { SignupFormData } from "../schemas/signup.schema";

type SignupResponse =
  | {
      success: true;
      message: string;
      userId: string;
    }
  | {
      success: false;
      message: string;
    };

function generateStudentCode() {
  return `STD-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

export class SignupService {
  static async signup(
    data: SignupFormData,
  ): Promise<SignupResponse> {
    try {
      const email = data.email.trim().toLowerCase();
      const phone = data.phone.trim();

      const existingUser =
        await SignupRepository.findUserByEmail(email);

      if (existingUser) {
        return {
          success: false,
          message:
            "An account with this email already exists.",
        };
      }

      const password = await bcrypt.hash(
        data.password,
        12,
      );

      const user =
        await SignupRepository.createStudentAccount({
          code: generateStudentCode(),
          firstName: data.firstName.trim(),
          lastName: data.lastName?.trim(),
          email,
          phone,
          password,
        });

      // DEMO MODE:
      // Email verification is temporarily disabled.
      // Users are created as verified during signup.
      console.log(
        "[SIGNUP] Email verification skipped (demo mode).",
      );

      return {
        success: true,
        message:
          "Account created successfully. You can login now.",
        userId: user.id,
      };
    } catch (error) {
      console.error("STUDENT SIGNUP ERROR:", error);

      return {
        success: false,
        message: "Failed to create your account.",
      };
    }
  }
}
