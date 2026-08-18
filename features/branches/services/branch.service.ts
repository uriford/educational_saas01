import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { db } from "@/lib/db";
import { BranchRepository } from "../repository/branch.repository";
import type {
  CreateBranchInput,
  SetBranchCreationPasswordInput,
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
        action: "UPDATE",
        entityType: "BranchCreationCredential",
        entityId: organizationId,
        description:
          "Branch creation password was created or changed by the headquarters administrator.",
      },
    });

    return {
      success: true,
      message:
        "Branch creation password updated successfully.",
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

    const branch = await BranchRepository.createBranch({
      organizationId,
      name: data.name.trim(),
      slug: createBranchSlug(data.name),
      code: createBranchCode(),
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      createdById: userId,
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
      message: `Branch "${branch.name}" created successfully.`,
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
      },
    };
  }
}
