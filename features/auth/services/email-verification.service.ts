import "server-only";

import { EmailService } from "@/features/notifications/services/email.service";
import { EmailVerificationRepository } from "../repository/email-verification.repository";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

export class EmailVerificationService {
  static async createAndSend(
    user: {
      id: string;
      email: string;
      firstName: string;
    },
  ) {
    await EmailVerificationRepository.invalidateExistingTokens(
      user.id,
    );

    const rawToken =
      EmailVerificationRepository.generateRawToken();

    const tokenHash =
      EmailVerificationRepository.hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        AUTH_CONSTANTS.VERIFICATION_TOKEN_EXPIRY_MS,
    );

    await EmailVerificationRepository.createToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const verificationUrl =
      `${baseUrl}/verify-email?token=${rawToken}`;

    const result = await EmailService.send({
      to: user.email,
      subject: "Verify your American Council account",
      text: `Hello ${user.firstName},

Please verify your American Council account by opening this link:

${verificationUrl}

This verification link will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your American Council account</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            Thank you for creating your student account.
            Please click the button below to verify your email address.
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#000;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            This link will expire in 30 minutes.
          </p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  }

  static async verify(token: string) {
    if (!token) {
      return {
        success: false,
        message: "Verification token is required.",
      };
    }

    const tokenHash =
      EmailVerificationRepository.hashToken(token);

    const verificationToken =
      await EmailVerificationRepository.findValidToken(
        tokenHash,
      );

    if (!verificationToken) {
      return {
        success: false,
        message:
          "This verification link is invalid or has expired.",
      };
    }

    const verifiedUser =
      await EmailVerificationRepository.markUserVerified(
        verificationToken.userId,
      );

    await EmailVerificationRepository.markUsed(
      verificationToken.id,
    );

    return {
      success: true,
      message:
        "Email verified successfully. You can now sign in.",
    };
  }
}
