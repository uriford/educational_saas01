import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import {
  createGuardian,
  findBranch,
  findStudents,
  findUserByEmail,
  getGuardianById,
  getGuardians,
  getGuardianManagementStudents,
  softDeleteGuardian,
  updateGuardian,
  updateGuardianStatus,
} from "../repository/guardian.repository";

import type {
  CreateGuardianInput,
  UpdateGuardianInput,
} from "../schemas/guardian.schema";

function generateGuardianCode() {
  return `GRD-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function generateTemporaryPassword() {
  return `Guardian@${crypto
    .randomBytes(8)
    .toString("base64url")}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeStudents(
  students: CreateGuardianInput["students"],
) {
  const unique = new Map<
    string,
    {
      studentId: string;
      relationship: string | null;
    }
  >();

  for (const student of students) {
    unique.set(student.studentId, {
      studentId: student.studentId,
      relationship:
        normalizeOptional(student.relationship),
    });
  }

  return Array.from(unique.values());
}

function assertCanManageGuardians(
  actorRole: string,
) {
  if (
    actorRole !== "ORGANIZATION_ADMIN" &&
    actorRole !== "BRANCH_ADMIN"
  ) {
    throw new Error(
      "Only organization and branch administrators can manage guardians.",
    );
  }
}

function assertBranchAccess(
  actorRole: string,
  actorBranchId: string | null,
  targetBranchId: string,
) {
  if (
    actorRole === "BRANCH_ADMIN" &&
    actorBranchId !== targetBranchId
  ) {
    throw new Error(
      "You can only manage guardians in your own branch.",
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

async function validateBranch(
  organizationId: string,
  branchId: string,
) {
  const branch = await findBranch(
    organizationId,
    branchId,
  );

  if (!branch) {
    throw new Error(
      "The selected branch does not exist or is inactive.",
    );
  }

  return branch;
}

async function validateStudents(
  organizationId: string,
  branchId: string,
  students: CreateGuardianInput["students"],
) {
  const normalizedStudents =
    normalizeStudents(students);

  if (normalizedStudents.length === 0) {
    throw new Error(
      "At least one student must be linked to the guardian.",
    );
  }

  const studentRecords = await findStudents(
    organizationId,
    branchId,
    normalizedStudents.map(
      (student) => student.studentId,
    ),
  );

  if (
    studentRecords.length !==
    normalizedStudents.length
  ) {
    throw new Error(
      "One or more selected students are invalid, inactive, deleted, or belong to another branch.",
    );
  }

  return normalizedStudents;
}

export class GuardianService {
  static async getManagementStudents(
    organizationId: string,
    actorBranchId: string | null,
    actorRole: string,
  ) {
    assertCanManageGuardians(actorRole);

    return getGuardianManagementStudents(
      organizationId,
      actorRole === "BRANCH_ADMIN"
        ? actorBranchId ?? undefined
        : undefined,
    );
  }


  static async getAll(
    organizationId: string,
    actorBranchId: string | null,
    actorRole: string,
    search?: string,
  ) {
    assertCanManageGuardians(actorRole);

    return getGuardians(
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
    guardianId: string,
  ) {
    assertCanManageGuardians(actorRole);

    const guardian = await getGuardianById(
      organizationId,
      guardianId,
    );

    if (!guardian) {
      return null;
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      guardian.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this guardian.",
      );
    }

    return guardian;
  }

  static async create(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    data: CreateGuardianInput,
  ) {
    assertCanManageGuardians(actorRole);

    assertBranchAccess(
      actorRole,
      actorBranchId,
      data.branchId,
    );

    const branch = await validateBranch(
      organizationId,
      data.branchId,
    );

    const email = normalizeEmail(data.email);

    const existingUser = await findUserByEmail(
      email,
    );

    if (existingUser) {
      throw new Error(
        "An account with this email already exists in this organization.",
      );
    }

    const students = await validateStudents(
      organizationId,
      branch.id,
      data.students,
    );

    const temporaryPassword =
      generateTemporaryPassword();

    const passwordHash =
      await bcrypt.hash(temporaryPassword, 12);

    const guardian = await createGuardian({
      organizationId,
      branchId: branch.id,
      code: generateGuardianCode(),
      firstName: data.firstName.trim(),
      lastName: normalizeOptional(data.lastName),
      email,
      phone: normalizeOptional(data.phone),
      password: passwordHash,
      createdById: actorUserId,
      students,
    });

    return {
      guardian,
      temporaryPassword,
    };
  }

  static async update(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    guardianId: string,
    data: UpdateGuardianInput,
  ) {
    assertCanManageGuardians(actorRole);

    assertNotSelf(
      actorUserId,
      guardianId,
    );

    assertBranchAccess(
      actorRole,
      actorBranchId,
      data.branchId,
    );

    const existingGuardian =
      await getGuardianById(
        organizationId,
        guardianId,
      );

    if (!existingGuardian) {
      throw new Error("Guardian not found.");
    }

    if (
      actorRole === "BRANCH_ADMIN" &&
      existingGuardian.branchId !== actorBranchId
    ) {
      throw new Error(
        "You do not have access to this guardian.",
      );
    }

    const branch = await validateBranch(
      organizationId,
      data.branchId,
    );

    const students = await validateStudents(
      organizationId,
      branch.id,
      data.students,
    );

    return updateGuardian(
      organizationId,
      guardianId,
      {
        branchId: branch.id,
        firstName: data.firstName.trim(),
        lastName: normalizeOptional(data.lastName),
        phone: normalizeOptional(data.phone),
        updatedById: actorUserId,
        students,
      },
    );
  }

  static async updateStatus(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    guardianId: string,
    status: "ACTIVE" | "SUSPENDED",
  ) {
    assertCanManageGuardians(actorRole);

    assertNotSelf(
      actorUserId,
      guardianId,
    );

    const guardian =
      await getGuardianById(
        organizationId,
        guardianId,
      );

    if (!guardian) {
      throw new Error("Guardian not found.");
    }

    if (!guardian.branchId) {
      throw new Error(
        "This guardian is not assigned to a branch.",
      );
    }

    assertBranchAccess(
      actorRole,
      actorBranchId,
      guardian.branchId,
    );

    return updateGuardianStatus(
      organizationId,
      guardianId,
      status,
      actorUserId,
    );
  }

  static async remove(
    organizationId: string,
    actorUserId: string,
    actorBranchId: string | null,
    actorRole: string,
    guardianId: string,
  ) {
    assertCanManageGuardians(actorRole);

    assertNotSelf(
      actorUserId,
      guardianId,
    );

    const guardian =
      await getGuardianById(
        organizationId,
        guardianId,
      );

    if (!guardian) {
      throw new Error("Guardian not found.");
    }

    if (!guardian.branchId) {
      throw new Error(
        "This guardian is not assigned to a branch.",
      );
    }

    assertBranchAccess(
      actorRole,
      actorBranchId,
      guardian.branchId,
    );

    return softDeleteGuardian(
      organizationId,
      guardianId,
      actorUserId,
    );
  }
}
