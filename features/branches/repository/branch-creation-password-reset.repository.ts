import "server-only";

import crypto from "node:crypto";

import { db } from "@/lib/db";

export class BranchCreationPasswordResetRepository {
  static generateRawToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  static hashToken(token: string) {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  static async invalidateExistingTokens(
    organizationId: string,
  ) {
    return db.branchCreationPasswordResetToken.updateMany({
      where: {
        organizationId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  static async createToken(data: {
    organizationId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return db.branchCreationPasswordResetToken.create({
      data,
    });
  }

  static async findValidToken(tokenHash: string) {
    return db.branchCreationPasswordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            organizationId: true,
            email: true,
            firstName: true,
            role: true,
            status: true,
            deletedAt: true,
            branchId: true,
            branch: {
              select: {
                id: true,
                isHeadquarters: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });
  }

  static async markUsed(id: string) {
    return db.branchCreationPasswordResetToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
