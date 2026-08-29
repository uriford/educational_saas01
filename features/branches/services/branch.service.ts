import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { db } from "@/lib/db";
import { BranchRepository } from "../repository/branch.repository";
import { BranchCreationPasswordResetRepository } from "../repository/branch-creation-password-reset.repository";
import { EmailService } from "@/features/notifications/services/email.service";
import type {
  CreateBranchInput,
  SetBranchCreationPasswordInput,
  ResetBranchCreationPasswordInput,
  AssignBranchAdminInput,
} from "../types";

const MIN_BRANCH_PASSWORD_LENGTH = 16;

function createBranchCode() {
  return `BR-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function createBranchSlug(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = crypto
    .randomBytes(4)
    .toString("hex");

  return `${normalized || "branch"}-${suffix}`;
}

function assertPasswordsMatch(
  password: string,
  confirmPassword: string,
) {
  if (password !== confirmPassword) {
    throw new Error(
      "New password and confirmation password do not match.",
    );
  }
}

function assertStrongPassword(password: string) {
  if (password.length < MIN_BRANCH_PASSWORD_LENGTH) {
    throw new Error(
      `Branch creation password must be at least ${MIN_BRANCH_PASSWORD_LENGTH} characters.`,
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error(
      "Branch creation password must contain at least one uppercase letter.",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new Error(
      "Branch creation password must contain at least one lowercase letter.",
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new Error(
      "Branch creation password must contain at least one number.",
    );
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error(
      "Branch creation password must contain at least one special character.",
    );
  }
}

export class BranchService {
  static async getOrganizationUsers(
    organizationId: string,
    userId: string,
  ) {
    const currentUser =
      await BranchRepository.getUserForBranchSecurity(
        userId,
        organizationId,
      );

    if (
      !currentUser ||
      currentUser.role !== "ORGANIZATION_ADMIN" ||
      !currentUser.branch ||
      currentUser.branch.deletedAt ||
      !currentUser.branch.isHeadquarters
    ) {
      throw new Error(
        "Only the headquarters organization administrator can manage branch administrators.",
      );
    }

    return BranchRepository.getOrganizationUsers(
      organizationId,
    );
  }

  static async assignBranchAdmin(
    organizationId: string,
    actorUserId: string,
    data: AssignBranchAdminInput,
  ) {
    const actor =
      await BranchRepository.getUserForBranchSecurity(
        actorUserId,
        organizationId,
      );

    if (
      !actor ||
      actor.role !== "ORGANIZATION_ADMIN" ||
      !actor.branch ||
      actor.branch.deletedAt ||
      !actor.branch.isHeadquarters
    ) {
      throw new Error(
        "Only the headquarters organization administrator can assign branch administrators.",
      );
    }

    const target =
      await BranchRepository.getUserForBranchAssignment(
        organizationId,
        data.userId,
      );

    if (!target) {
      throw new Error("User not found.");
    }

    if (target.role === "ORGANIZATION_ADMIN") {
      throw new Error(
        "An organization administrator cannot be assigned as a branch administrator.",
      );
    }

    if (target.role !== "BRANCH_ADMIN") {
      throw new Error(
        "Only an existing branch administrator account can be assigned to a branch.",
      );
    }

    const branch =
      await BranchRepository.findBranch(
        organizationId,
        data.branchId,
      );

    if (!branch) {
      throw new Error("Branch not found.");
    }

    if (branch.status !== "ACTIVE") {
      throw new Error(
        "Only an active branch can have a branch administrator.",
      );
    }

    const previousBranchId = target.branchId;

    await BranchRepository.updateBranchAdministrator(
      organizationId,
      target.id,
      branch.id,
    );

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: branch.id,
        userId: actorUserId,
        action: "UPDATE",
        entityType: "User",
        entityId: target.id,
        description:
          `User "${target.email}" was assigned as branch administrator for "${branch.name}".`,
      },
    });

    return {
      success: true,
      message:
        `${target.email} is now the branch administrator of ${branch.name}.`,
      previousBranchId,
      branchId: branch.id,
    };
  }

  static async getAllBranches(
    organizationId: string,
  ) {
    return BranchRepository.getAllBranches(
      organizationId,
    );
  }

  static async getBranchById(
    organizationId: string,
    branchId: string,
  ) {
    return BranchRepository.getBranchById(
      organizationId,
      branchId,
    );
  }

  static async getSecurityStatus(
    organizationId: string,
  ) {
    const credential =
      await BranchRepository.getCreationCredential(
        organizationId,
      );

    return {
      configured: Boolean(credential),
      updatedAt: credential?.updatedAt ?? null,
    };
  }

  static async updateBranchEmail(
    organizationId: string,
    userId: string,
    email: string,
  ) {
    const user =
      await BranchRepository.getUserForBranchSecurity(
        userId,
        organizationId,
      );

    if (!user) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (user.role !== "BRANCH_ADMIN") {
      return {
        success: false,
        message:
          "Only branch administrators can update their branch email.",
      };
    }

    if (
      !user.branchId ||
      !user.branch ||
      user.branch.deletedAt
    ) {
      return {
        success: false,
        message:
          "Your account is not assigned to an active branch.",
      };
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return {
        success: false,
        message: "Branch email is required.",
      };
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    const result =
      await BranchRepository.updateBranchEmail(
        organizationId,
        user.branchId,
        normalizedEmail,
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "Branch not found.",
      };
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: user.branchId,
        userId,
        action: "UPDATE",
        entityType: "Branch",
        entityId: user.branchId,
        description:
          `Branch email was updated to "${normalizedEmail}".`,
      },
    });

    return {
      success: true,
      message: "Branch email updated successfully.",
    };
  }

  static async setCreationPassword(
    organizationId: string,
    userId: string,
    data: SetBranchCreationPasswordInput,
  ) {
    const user =
      await BranchRepository.getUserForBranchSecurity(
        userId,
        organizationId,
      );

    if (!user) {
      throw new Error("Unauthorized.");
    }

    if (user.role !== "ORGANIZATION_ADMIN") {
      throw new Error(
        "Only an organization admin can manage the branch creation password.",
      );
    }

    if (
      !user.branchId ||
      !user.branch ||
      user.branch.deletedAt ||
      !user.branch.isHeadquarters
    ) {
      throw new Error(
        "Only the headquarters administrator can manage the branch creation password.",
      );
    }

    assertStrongPassword(data.password);

    assertPasswordsMatch(
      data.password,
      data.confirmPassword,
    );

    const existingCredential =
      await BranchRepository.getCreationCredential(
        organizationId,
      );

    /*
     * INITIAL SETUP
     */
    if (data.mode === "INITIAL") {
      if (existingCredential) {
        throw new Error(
          "The branch creation password is already configured. Enter the current password to change it.",
        );
      }

      const passwordHash = await bcrypt.hash(
        data.password,
        12,
      );

      await BranchRepository.createCreationCredential(
        organizationId,
        passwordHash,
      );

      await db.auditLog.create({
        data: {
          organizationId,
          branchId: user.branchId,
          userId,
          action: "CREATE",
          entityType: "BranchCreationCredential",
          entityId: organizationId,
          description:
            "Initial branch creation password was configured by the headquarters administrator.",
        },
      });

      return {
        success: true,
        message:
          "Branch creation password configured successfully.",
      };
    }

    /*
     * CHANGE EXISTING PASSWORD
     */
    if (!existingCredential) {
      throw new Error(
        "The branch creation password has not been configured yet. Please create it first.",
      );
    }

    if (!data.currentPassword) {
      throw new Error(
        "Current branch creation password is required.",
      );
    }

    const currentPasswordMatches =
      await bcrypt.compare(
        data.currentPassword,
        existingCredential.passwordHash,
      );

    if (!currentPasswordMatches) {
      await db.auditLog.create({
        data: {
          organizationId,
          branchId: user.branchId,
          userId,
          action: "UPDATE",
          entityType:
            "BranchCreationCredentialAttempt",
          entityId: organizationId,
          description:
            "Failed branch creation password change because the current password was invalid.",
        },
      });

      throw new Error(
        "Current branch creation password is incorrect.",
      );
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12,
    );

    await BranchRepository.updateCreationCredential(
      organizationId,
      passwordHash,
    );

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: user.branchId,
        userId,
        action: "UPDATE",
        entityType: "BranchCreationCredential",
        entityId: organizationId,
        description:
          "Branch creation password was changed after successful current-password verification.",
      },
    });

    return {
      success: true,
      message:
        "Branch creation password changed successfully.",
    };
  }

  static async requestCreationPasswordReset(
    organizationId: string,
    userId: string,
  ) {
    const user =
      await BranchRepository.getUserForBranchSecurity(
        userId,
        organizationId,
      );

    if (!user) {
      throw new Error("Unauthorized.");
    }

    if (user.role !== "ORGANIZATION_ADMIN") {
      throw new Error(
        "Only an organization admin can reset the branch creation password.",
      );
    }

    if (
      !user.branchId ||
      !user.branch ||
      user.branch.deletedAt ||
      !user.branch.isHeadquarters
    ) {
      throw new Error(
        "Only the headquarters administrator can reset the branch creation password.",
      );
    }

    if (!user.email) {
      throw new Error(
        "No recovery email is configured for this administrator account.",
      );
    }

    const credential =
      await BranchRepository.getCreationCredential(
        organizationId,
      );

    if (!credential) {
      throw new Error(
        "The branch creation password has not been configured yet.",
      );
    }

    await BranchCreationPasswordResetRepository.invalidateExistingTokens(
      organizationId,
    );

    const rawToken =
      BranchCreationPasswordResetRepository.generateRawToken();

    const tokenHash =
      BranchCreationPasswordResetRepository.hashToken(
        rawToken,
      );

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000,
    );

    await BranchCreationPasswordResetRepository.createToken({
      organizationId,
      userId,
      tokenHash,
      expiresAt,
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/branch-security/reset-password?token=${rawToken}`;

    const result = await EmailService.send({
      to: user.email,
      subject:
        "Reset your American Council branch creation password",
      text: `Hello ${user.firstName},

A request was made to reset the branch creation password for your American Council organization.

Reset the branch creation password using this link:

${resetUrl}

This link will expire in 30 minutes and can only be used once.

If you did not request this reset, you can safely ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Reset Branch Creation Password</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            A request was made to reset the branch creation
            password for your American Council organization.
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
              Reset Branch Creation Password
            </a>
          </p>

          <p>
            This link will expire in 30 minutes and can only
            be used once.
          </p>

          <p>
            If you did not request this reset, you can safely
            ignore this email.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      console.error(
        "BRANCH CREATION PASSWORD RESET EMAIL ERROR:",
        result.message,
      );

      throw new Error(
        "Unable to send the password reset email. Please try again later.",
      );
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: user.branchId,
        userId,
        action: "CREATE",
        entityType:
          "BranchCreationPasswordResetRequest",
        entityId: organizationId,
        description:
          "A branch creation password reset email was requested.",
      },
    });

    return {
      success: true,
      message:
        "A password reset link has been sent to your registered administrator email address.",
    };
  }

  static async resetCreationPassword(
    data: ResetBranchCreationPasswordInput,
  ) {
    if (!data.token) {
      throw new Error(
        "Password reset token is required.",
      );
    }

    assertStrongPassword(data.password);

    assertPasswordsMatch(
      data.password,
      data.confirmPassword,
    );

    const tokenHash =
      BranchCreationPasswordResetRepository.hashToken(
        data.token,
      );

    const resetToken =
      await BranchCreationPasswordResetRepository.findValidToken(
        tokenHash,
      );

    if (!resetToken) {
      return {
        success: false,
        message:
          "This branch password reset link is invalid or has expired.",
      };
    }

    const user = resetToken.user;

    if (
      user.role !== "ORGANIZATION_ADMIN" ||
      user.status !== "ACTIVE" ||
      user.deletedAt ||
      user.organizationId !==
        resetToken.organizationId ||
      !user.branch ||
      user.branch.deletedAt ||
      !user.branch.isHeadquarters ||
      resetToken.organization.status !== "ACTIVE"
    ) {
      return {
        success: false,
        message:
          "This branch password reset link is no longer valid.",
      };
    }

    const passwordHash =
      await bcrypt.hash(data.password, 12);

    const branchId = user.branch.id;

    await db.$transaction(async (tx) => {
      await tx.branchCreationCredential.update({
        where: {
          organizationId:
            resetToken.organizationId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.branchCreationPasswordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.branchCreationPasswordResetToken.updateMany({
        where: {
          organizationId:
            resetToken.organizationId,
          usedAt: null,
          id: {
            not: resetToken.id,
          },
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId:
            resetToken.organizationId,
          branchId,
          userId: user.id,
          action: "UPDATE",
          entityType:
            "BranchCreationCredential",
          entityId:
            resetToken.organizationId,
          description:
            "Branch creation password was reset through verified administrator email recovery.",
        },
      });
    });

    return {
      success: true,
      message:
        "Branch creation password reset successfully.",
    };
  }

  static async createBranch(
    organizationId: string,
    userId: string,
    data: CreateBranchInput,
  ) {
    const user =
      await BranchRepository.getUserForBranchSecurity(
        userId,
        organizationId,
      );

    if (!user) {
      throw new Error("Unauthorized.");
    }

    if (user.role !== "ORGANIZATION_ADMIN") {
      throw new Error(
        "Only organization admins can create branches.",
      );
    }

    if (!data.name.trim()) {
      throw new Error("Branch name is required.");
    }

    const branchEmail = data.email?.trim().toLowerCase();

    if (!branchEmail) {
      throw new Error(
        "Branch email is required because it will be used as the Branch Administrator login email.",
      );
    }

    if (!data.creationPassword) {
      throw new Error(
        "Branch creation password is required.",
      );
    }

    const credential =
      await BranchRepository.getCreationCredential(
        organizationId,
      );

    if (!credential) {
      throw new Error(
        "Branch creation has not been configured yet. Ask the headquarters administrator to set the branch creation password.",
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        data.creationPassword,
        credential.passwordHash,
      );

    if (!passwordMatches) {
      await db.auditLog.create({
        data: {
          organizationId,
          userId,
          action: "CREATE",
          entityType: "BranchCreationAttempt",
          entityId: organizationId,
          description:
            "Failed branch creation attempt because the special branch creation password was invalid.",
        },
      });

      throw new Error(
        "Invalid branch creation password.",
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        organizationId,
        email: branchEmail,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new Error(
        "A user account with this branch email already exists in the organization.",
      );
    }

    const branch = await BranchRepository.createBranch({
      organizationId,
      name: data.name.trim(),
      slug: createBranchSlug(data.name),
      code: createBranchCode(),
      email: branchEmail,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      createdById: userId,
    });

    const temporaryPassword =
      `Branch@${crypto.randomBytes(8).toString("base64url")}`;

    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      12,
    );

    const branchAdminCode =
      `USR-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

    const branchAdmin = await db.user.create({
      data: {
        organizationId,
        branchId: branch.id,
        code: branchAdminCode,
        firstName: "Branch",
        lastName: "Administrator",
        email: branchEmail,
        password: passwordHash,
        role: "BRANCH_ADMIN",
        status: "ACTIVE",
        emailVerified: false,
        isBranchManager: true,
        createdById: userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: branch.id,
        userId,
        action: "CREATE",
        entityType: "User",
        entityId: branchAdmin.id,
        description:
          `Branch administrator "${branchAdmin.email}" was automatically created for branch "${branch.name}".`,
      },
    });

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: branch.id,
        userId,
        action: "CREATE",
        entityType: "Branch",
        entityId: branch.id,
        description: `Branch "${branch.name}" was created.`,
      },
    });

    return {
      success: true,
      message: `Branch "${branch.name}" and its Branch Administrator account were created successfully.`,
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        email: branch.email,
      },
      branchAdmin: {
        id: branchAdmin.id,
        email: branchAdmin.email,
        role: branchAdmin.role,
      },
      temporaryPassword,
    };
  }
}
