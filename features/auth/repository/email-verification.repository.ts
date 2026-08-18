import { db } from "@/lib/db";
import crypto from "crypto";

export class EmailVerificationRepository {
  static async createToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return db.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  static async findValidToken(tokenHash: string) {
    return db.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  static async markUsed(id: string) {
    return db.emailVerificationToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  static async markUserVerified(userId: string) {
    return db.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    });
  }

  static async invalidateExistingTokens(userId: string) {
    return db.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
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
