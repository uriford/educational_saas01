import "server-only";

import crypto from "node:crypto";

import { db } from "@/lib/db";

export class AccountInvitationRepository {
  /**
   * Generate a cryptographically secure raw invitation token.
   *
   * The raw token is returned only to the service so it can be
   * embedded in the invitation URL. We never persist it.
   */
  static generateRawToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hash the raw token before persistence.
   *
   * If the database is compromised, the attacker cannot directly
   * use the stored value as an invitation credential.
   */
  static hashToken(token: string) {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  /**
   * Create a new invitation.
   */
  static async create(data: {
    organizationId: string;
    branchId: string;
    invitedById: string;
    email: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    role: "ORGANIZATION_ADMIN" | "BRANCH_ADMIN";
    tokenHash: string;
    expiresAt: Date;
  }) {
    return db.accountInvitation.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        invitedById: data.invitedById,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        invitedById: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Find an invitation that is still usable.
   *
   * The token must:
   * - exist
   * - not be accepted
   * - not be revoked
   * - not be expired
   */
  static async findValidByTokenHash(
    tokenHash: string,
  ) {
    return db.accountInvitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            status: true,
            deletedAt: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            deletedAt: true,
            isHeadquarters: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find a pending invitation for a specific email.
   *
   * Used before creating a new invitation so we don't accumulate
   * multiple active invitations for the same administrator.
   */
  static async findPendingByEmail(
    organizationId: string,
    email: string,
  ) {
    return db.accountInvitation.findFirst({
      where: {
        organizationId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        invitedById: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Revoke one invitation.
   */
  static async revoke(id: string) {
    return db.accountInvitation.updateMany({
      where: {
        id,
        acceptedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all pending invitations for an email in an organization.
   *
   * This is useful when sending a replacement invitation.
   */
  static async revokePendingByEmail(
    organizationId: string,
    email: string,
  ) {
    return db.accountInvitation.updateMany({
      where: {
        organizationId,
        email,
        acceptedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Mark an invitation as accepted.
   *
   * The conditions are intentionally repeated here so an already-used
   * invitation cannot be accepted a second time.
   */
  static async markAccepted(id: string) {
    return db.accountInvitation.updateMany({
      where: {
        id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        acceptedAt: new Date(),
      },
    });
  }

  /**
   * List pending invitations for an organization.
   */
  static async getPending(
    organizationId: string,
    branchId?: string,
  ) {
    return db.accountInvitation.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        invitedById: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        expiresAt: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
