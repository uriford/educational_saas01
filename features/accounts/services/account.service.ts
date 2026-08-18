import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { db } from "@/lib/db";

import {
  createAccount,
  findBranch,
  findUserByEmail,
  countActiveOrganizationAdmins,
  getAccountById,
  getAccounts,
  softDeleteAccount,
  updateAccount,
  updateAccountPassword,
  updateAccountStatus,
} from "../repository/account.repository";

import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "../schemas/account.schema";

function generateAccountCode() {
  return `USR-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function generateTemporaryPassword() {
  return `Account@${crypto
    .randomBytes(6)
    .toString("base64url")}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertCanManageTarget(
  actorRole: string,
  targetRole: string,
) {
  if (targetRole === "SUPER_ADMIN") {
    throw new Error(
      "Super administrators cannot be managed from organization Account Management.",
    );
  }

  if (
    targetRole !== "ORGANIZATION_ADMIN" &&
    targetRole !== "BRANCH_ADMIN"
  ) {
    throw new Error(
      "Only organization and branch administrator accounts can be managed here.",
    );
  }

  if (
    actorRole === "BRANCH_ADMIN" &&
    targetRole !== "BRANCH_ADMIN"
  ) {
    throw new Error(
      "Branch administrators can only manage branch-level administrator accounts.",
    );
  }
}

function assertNotSelf(
  actorUserId: string,
  targetUserId: string,
) {
  if (actorUserId === targetUserId) {
    throw new Error(
      "You cannot perform this administrative action on your own account.",
    );
  }
}

async function assertNotLastActiveOrganizationAdmin(
  organizationId: string,
  targetRole: string,
  targetStatus: string,
  operation: "SUSPEND" | "DELETE" | "DEMOTE",
) {
  if (
    targetRole !== "ORGANIZATION_ADMIN" ||
    targetStatus !== "ACTIVE"
  ) {
    return;
  }

  const activeAdminCount =
    await countActiveOrganizationAdmins(
      organizationId,
    );

  if (activeAdminCount <= 1) {
    const messages = {
      SUSPEND:
        "The organization must always have at least one active organization administrator.",
      DELETE:
        "The last active organization administrator cannot be deleted.",
      DEMOTE:
        "The last active organization administrator cannot be demoted.",
    };

    throw new Error(messages[operation]);
  }
}

export class AccountService {
  static async getAll(
    organizationId: string,
    actorBranchId: string | null,
    actorRole: string,
    search?: string,
  ) {
    return getAccounts(
      organizationId,
      actorRole === "BRANCH_ADMIN"
        ? actorBranchId ?? undefined
        : undefined,
      search,
    );
  }

  static async getById(
    organizationId: string,
    actorBranchId: string | null,
    actorRole: string,
    userId: string,
  ) {
    const account = await getAccountById(
      organizationId,
      userId,
    );

    if (!account) {
      return null;
    }

    assertCanManageTarget(
      actorRole,
      account.role,
    );

    if (
      actorRole === "BRANCH_ADMIN" &&
      account.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this account.",
      );
    }

    return account;
  }

  static async create(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    data: CreateAccountInput,
  ) {
    if (
      actorRole !== "ORGANIZATION_ADMIN" &&
      actorRole !== "BRANCH_ADMIN"
    ) {
      throw new Error("Forbidden");
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      data.role !== "BRANCH_ADMIN"
    ) {
      throw new Error(
        "Branch administrators can only create branch-level accounts.",
      );
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      data.branchId !== actorBranchId
    ) {
      throw new Error(
        "You can only create accounts in your own branch.",
      );
    }

    const branchId =
      data.branchId ??
      actorBranchId;

    if (!branchId) {
      throw new Error(
        "A branch is required for this account.",
      );
    }

    const branch = await findBranch(
      organizationId,
      branchId,
    );

    if (!branch) {
      throw new Error(
        "Branch not found or inactive.",
      );
    }

    if (
      data.role === "ORGANIZATION_ADMIN" &&
      !branch.isHeadquarters
    ) {
      throw new Error(
        "Organization administrators must be assigned to the headquarters branch.",
      );
    }

    const email = normalizeEmail(data.email);

    const existing = await findUserByEmail(
      email,
      organizationId,
    );

    if (existing) {
      throw new Error(
        "An account with this email already exists.",
      );
    }

    const temporaryPassword =
      generateTemporaryPassword();

    const password = await bcrypt.hash(
      temporaryPassword,
      12,
    );

    const account = await createAccount({
      organizationId,
      branchId: branch.id,
      code: generateAccountCode(),
      firstName: data.firstName.trim(),
      lastName:
        data.lastName?.trim() || null,
      email,
      phone:
        data.phone?.trim() || null,
      password,
      role: data.role,
      createdById: actorUserId,
    });

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: branch.id,
        userId: actorUserId,
        action: "CREATE",
        entityType: "User",
        entityId: account.id,
        description:
          `Account "${account.email}" was created with role "${account.role}".`,
      },
    });

    return {
      success: true as const,
      account,
      temporaryPassword,
    };
  }

  static async update(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    userId: string,
    data: UpdateAccountInput,
  ) {
    if (
      actorRole !== "ORGANIZATION_ADMIN" &&
      actorRole !== "BRANCH_ADMIN"
    ) {
      throw new Error("Forbidden");
    }

    const target = await getAccountById(
      organizationId,
      userId,
    );

    if (!target) {
      throw new Error("Account not found.");
    }

    assertNotSelf(
      actorUserId,
      userId,
    );

    assertCanManageTarget(
      actorRole,
      target.role,
    );

    if (
      actorRole === "BRANCH_ADMIN" &&
      target.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this account.",
      );
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      data.role !== "BRANCH_ADMIN"
    ) {
      throw new Error(
        "Branch administrators cannot promote accounts to organization administrators.",
      );
    }

    if (
      target.role === "ORGANIZATION_ADMIN" &&
      target.status === "ACTIVE" &&
      data.role !== "ORGANIZATION_ADMIN"
    ) {
      await assertNotLastActiveOrganizationAdmin(
        organizationId,
        target.role,
        target.status,
        "DEMOTE",
      );
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      data.branchId !== actorBranchId
    ) {
      throw new Error(
        "You can only assign accounts to your own branch.",
      );
    }

    const branch = await findBranch(
      organizationId,
      data.branchId ?? "",
    );

    if (!branch) {
      throw new Error(
        "Branch not found or inactive.",
      );
    }

    if (
      data.role === "ORGANIZATION_ADMIN" &&
      !branch.isHeadquarters
    ) {
      throw new Error(
        "Organization administrators must be assigned to the headquarters branch.",
      );
    }

    const result = await updateAccount(
      organizationId,
      userId,
      {
        firstName: data.firstName.trim(),
        lastName:
          data.lastName?.trim() || null,
        phone:
          data.phone?.trim() || null,
        role: data.role,
        branchId: branch.id,
        updatedById: actorUserId,
      },
    );

    if (result.count === 0) {
      throw new Error("Account not found.");
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: branch.id,
        userId: actorUserId,
        action: "UPDATE",
        entityType: "User",
        entityId: userId,
        description:
          `Account "${target.email}" was updated.`,
      },
    });

    return {
      success: true as const,
      message: "Account updated successfully.",
    };
  }

  static async updateStatus(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    userId: string,
    status: "ACTIVE" | "SUSPENDED",
  ) {
    if (
      actorRole !== "ORGANIZATION_ADMIN" &&
      actorRole !== "BRANCH_ADMIN"
    ) {
      throw new Error("Forbidden");
    }

    const target = await getAccountById(
      organizationId,
      userId,
    );

    if (!target) {
      throw new Error("Account not found.");
    }

    assertNotSelf(
      actorUserId,
      userId,
    );

    assertCanManageTarget(
      actorRole,
      target.role,
    );

    if (
      actorRole === "BRANCH_ADMIN" &&
      target.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this account.",
      );
    }

    if (
      status === "SUSPENDED"
    ) {
      await assertNotLastActiveOrganizationAdmin(
        organizationId,
        target.role,
        target.status,
        "SUSPEND",
      );
    }

    const result =
      await updateAccountStatus(
        organizationId,
        userId,
        status,
        actorUserId,
      );

    if (result.count === 0) {
      throw new Error("Account not found.");
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: target.branchId,
        userId: actorUserId,
        action: "UPDATE",
        entityType: "User",
        entityId: userId,
        description:
          `Account "${target.email}" status changed to "${status}".`,
      },
    });

    return {
      success: true as const,
      message:
        status === "ACTIVE"
          ? "Account activated successfully."
          : "Account suspended successfully.",
    };
  }

  static async resetPassword(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    userId: string,
  ) {
    if (
      actorRole !== "ORGANIZATION_ADMIN" &&
      actorRole !== "BRANCH_ADMIN"
    ) {
      throw new Error("Forbidden");
    }

    const target = await getAccountById(
      organizationId,
      userId,
    );

    if (!target) {
      throw new Error("Account not found.");
    }

    assertNotSelf(
      actorUserId,
      userId,
    );

    assertCanManageTarget(
      actorRole,
      target.role,
    );

    if (
      actorRole === "BRANCH_ADMIN" &&
      target.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this account.",
      );
    }

    const temporaryPassword =
      generateTemporaryPassword();

    const password = await bcrypt.hash(
      temporaryPassword,
      12,
    );

    const result =
      await updateAccountPassword(
        organizationId,
        userId,
        password,
        actorUserId,
      );

    if (result.count === 0) {
      throw new Error("Account not found.");
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: target.branchId,
        userId: actorUserId,
        action: "UPDATE",
        entityType: "UserPassword",
        entityId: userId,
        description:
          `Password for "${target.email}" was reset.`,
      },
    });

    return {
      success: true as const,
      temporaryPassword,
    };
  }

  static async delete(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    userId: string,
  ) {
    if (
      actorRole !== "ORGANIZATION_ADMIN" &&
      actorRole !== "BRANCH_ADMIN"
    ) {
      throw new Error("Forbidden");
    }

    const target = await getAccountById(
      organizationId,
      userId,
    );

    if (!target) {
      throw new Error("Account not found.");
    }

    assertNotSelf(
      actorUserId,
      userId,
    );

    assertCanManageTarget(
      actorRole,
      target.role,
    );

    if (
      actorRole === "BRANCH_ADMIN" &&
      target.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this account.",
      );
    }

    await assertNotLastActiveOrganizationAdmin(
      organizationId,
      target.role,
      target.status,
      "DELETE",
    );

    const result =
      await softDeleteAccount(
        organizationId,
        userId,
        actorUserId,
      );

    if (result.count === 0) {
      throw new Error("Account not found.");
    }

    await db.auditLog.create({
      data: {
        organizationId,
        branchId: target.branchId,
        userId: actorUserId,
        action: "DELETE",
        entityType: "User",
        entityId: userId,
        description:
          `Account "${target.email}" was deleted.`,
      },
    });

    return {
      success: true as const,
      message: "Account deleted successfully.",
    };
  }
}
