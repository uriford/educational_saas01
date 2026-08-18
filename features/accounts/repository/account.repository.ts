import "server-only";

import { db } from "@/lib/db";

export async function getAccounts(
  organizationId: string,
  branchId?: string,
  search?: string,
) {
  const normalizedSearch = search?.trim();

  return db.user.findMany({
    where: {
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
      ...(branchId ? { branchId } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              {
                firstName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      code: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      lastLoginAt: true,
      branchId: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });
}

export async function getAccountById(
  organizationId: string,
  userId: string,
) {
  return db.user.findFirst({
    where: {
      id: userId,
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
    },
    select: {
      id: true,
      code: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      lastLoginAt: true,
      organizationId: true,
      branchId: true,
      isBranchManager: true,
      createdAt: true,
      updatedAt: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          isHeadquarters: true,
        },
      },
    },
  });
}

export async function findUserByEmail(
  email: string,
  organizationId: string,
) {
  return db.user.findFirst({
    where: {
      email,
      organizationId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });
}

export async function countActiveOrganizationAdmins(
  organizationId: string,
) {
  return db.user.count({
    where: {
      organizationId,
      deletedAt: null,
      status: "ACTIVE",
      role: "ORGANIZATION_ADMIN",
    },
  });
}

export async function findBranch(
  organizationId: string,
  branchId: string,
) {
  return db.branch.findFirst({
    where: {
      id: branchId,
      organizationId,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      isHeadquarters: true,
    },
  });
}

export async function createAccount(data: {
  organizationId: string;
  branchId: string;
  code: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  password: string;
  role: "ORGANIZATION_ADMIN" | "BRANCH_ADMIN";
  createdById: string;
}) {
  return db.user.create({
    data: {
      organizationId: data.organizationId,
      branchId: data.branchId,
      code: data.code,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      status: "ACTIVE",
      emailVerified: false,
      isBranchManager: data.role === "BRANCH_ADMIN",
      createdById: data.createdById,
    },
    select: {
      id: true,
      code: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      branchId: true,
      createdAt: true,
    },
  });
}

export async function updateAccount(
  organizationId: string,
  userId: string,
  data: {
    firstName: string;
    lastName: string | null;
    phone: string | null;
    role: "ORGANIZATION_ADMIN" | "BRANCH_ADMIN";
    branchId: string;
    updatedById: string;
  },
) {
  return db.user.updateMany({
    where: {
      id: userId,
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      branchId: data.branchId,
      isBranchManager: data.role === "BRANCH_ADMIN",
      updatedById: data.updatedById,
    },
  });
}

export async function updateAccountStatus(
  organizationId: string,
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
  updatedById: string,
) {
  return db.user.updateMany({
    where: {
      id: userId,
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
    },
    data: {
      status,
      updatedById,
    },
  });
}

export async function updateAccountPassword(
  organizationId: string,
  userId: string,
  password: string,
  updatedById: string,
) {
  return db.user.updateMany({
    where: {
      id: userId,
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
    },
    data: {
      password,
      updatedById,
    },
  });
}

export async function softDeleteAccount(
  organizationId: string,
  userId: string,
  updatedById: string,
) {
  return db.user.updateMany({
    where: {
      id: userId,
      organizationId,
      deletedAt: null,
      role: {
        in: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN"],
      },
    },
    data: {
      deletedAt: new Date(),
      status: "SUSPENDED",
      updatedById,
    },
  });
}
