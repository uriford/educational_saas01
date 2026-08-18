import { db } from "@/lib/db";
import crypto from "crypto";

export class PasswordResetRepository {
  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });
  }

  static async createToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return db.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  static async findValidToken(tokenHash: string) {
    return db.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  static async markUsed(id: string) {
    return db.passwordResetToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  static async invalidateExistingTokens(userId: string) {
    return db.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  static async updatePassword(
    userId: string,
    password: string,
  ) {
    return db.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    });
  }

  static generateRawToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  static hashToken(token: string) {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }
}
