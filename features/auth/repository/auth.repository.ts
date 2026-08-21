import { db } from "@/lib/db";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  static async findUserById(id: string) {
    return db.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  static async updateLastLogin(id: string) {
    return db.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async updatePassword(id: string, password: string) {
    return db.user.update({
      where: { id },
      data: { password },
    });
  }

  static async getLoginAttempt(identifier: string) {
    return db.loginAttempt.findUnique({
      where: { identifier },
    });
  }

  static async recordLoginFailure(
    identifier: string,
    maxAttempts: number,
    blockMs: number,
  ) {
    const now = new Date();

    return db.$transaction(async (tx) => {
      const existing = await tx.loginAttempt.findUnique({
        where: { identifier },
      });

      if (
        existing &&
        now.getTime() - existing.windowStart.getTime() >=
          15 * 60 * 1000
      ) {
        return tx.loginAttempt.update({
          where: { identifier },
          data: {
            attempts: 1,
            windowStart: now,
            blockedUntil: null,
          },
        });
      }

      const attempt = existing
        ? await tx.loginAttempt.update({
            where: { identifier },
            data: {
              attempts: { increment: 1 },
            },
          })
        : await tx.loginAttempt.create({
            data: {
              identifier,
              attempts: 1,
              windowStart: now,
            },
          });

      if (attempt.attempts >= maxAttempts) {
        return tx.loginAttempt.update({
          where: { identifier },
          data: {
            blockedUntil: new Date(
              now.getTime() + blockMs,
            ),
          },
        });
      }

      return attempt;
    });
  }

  static async resetLoginAttempt(identifier: string) {
    return db.loginAttempt.upsert({
      where: { identifier },
      create: {
        identifier,
        attempts: 0,
        windowStart: new Date(),
        blockedUntil: null,
      },
      update: {
        attempts: 0,
        windowStart: new Date(),
        blockedUntil: null,
      },
    });
  }
}
