import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { SignupRepository } from "../repository/signup.repository";
import type { SignupFormData } from "../schemas/signup.schema";
import { EmailVerificationService } from "./email-verification.service";

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

      try {
        await EmailVerificationService.createAndSend({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
        });
      } catch (emailError) {
        console.error(
          "========== VERIFICATION EMAIL ERROR ==========",
        );
        console.error(emailError);
        console.error(
          "========== VERIFICATION EMAIL ERROR STACK ==========",
        );

        if (emailError instanceof Error) {
          console.error(emailError.stack);
        }

        return {
          success: false,
          message:
            "Account was created, but we could not send the verification email. Please try again later.",
        };
      }

      return {
        success: true,
        message:
          "Account created successfully. Please check your email to verify your account.",
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
