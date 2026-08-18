import "server-only";

import bcrypt from "bcrypt";

import { EmailService } from "@/features/notifications/services/email.service";

import { PasswordResetRepository } from "../repository/password-reset.repository";
import type { ForgotPasswordFormData } from "../schemas/forgot-password.schema";
import type { ResetPasswordFormData } from "../schemas/reset-password.schema";
import { AuthRepository } from "../repository/auth.repository";

const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

export class PasswordResetService {
  static async requestReset(
    data: ForgotPasswordFormData,
  ) {
    const email = data.email.trim().toLowerCase();

    const user =
      await AuthRepository.findUserByEmail(email);

    /*
     * Never reveal whether an email belongs to an account.
     */
    if (!user || user.status !== "ACTIVE") {
      return {
        success: true as const,
        message: GENERIC_FORGOT_PASSWORD_MESSAGE,
      };
    }

    await PasswordResetRepository.invalidateExistingTokens(
      user.id,
    );

    const rawToken =
      PasswordResetRepository.generateRawToken();

    const tokenHash =
      PasswordResetRepository.hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MS,
    );

    await PasswordResetRepository.createToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/reset-password?token=${rawToken}`;

    const result = await EmailService.send({
      to: user.email,
      subject:
        "Reset your American Council password",
      text: `Hello ${user.firstName},

We received a request to reset your American Council password.

Reset your password using this link:

${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset your American Council password</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            We received a request to reset your
            American Council account password.
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#000;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link will expire in 30 minutes.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      /*
       * Do not expose provider/configuration details to
       * the user. Log the actual failure server-side.
       */
      console.error(
        "PASSWORD RESET EMAIL ERROR:",
        result.message,
      );

      return {
        success: false as const,
        message:
          "Unable to send the password reset email. Please try again later.",
      };
    }

    return {
      success: true as const,
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    };
  }

  static async resetPassword(
    data: ResetPasswordFormData,
  ) {
    const tokenHash =
      PasswordResetRepository.hashToken(data.token);

    const resetToken =
      await PasswordResetRepository.findValidToken(
        tokenHash,
      );

    if (!resetToken) {
      return {
        success: false as const,
        message:
          "This password reset link is invalid or has expired.",
      };
    }

    if (
      resetToken.user.status !== "ACTIVE" ||
      resetToken.user.deletedAt
    ) {
      return {
        success: false as const,
        message:
          "This password reset link is no longer valid.",
      };
    }

    const password = await bcrypt.hash(
      data.password,
      12,
    );

    await AuthRepository.updatePassword(
      resetToken.userId,
      password,
    );

    await PasswordResetRepository.markUsed(
      resetToken.id,
    );

    /*
     * Invalidate any other unused reset tokens belonging
     * to this user as an additional safety measure.
     */
    await PasswordResetRepository.invalidateExistingTokens(
      resetToken.userId,
    );

    return {
      success: true as const,
      message:
        "Your password has been reset successfully. You can now sign in.",
    };
  }
}
