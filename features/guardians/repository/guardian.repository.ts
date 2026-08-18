import "server-only";

import { db } from "@/lib/db";

export async function getGuardians(
  organizationId: string,
  branchId?: string,
  search?: string,
) {
  const normalizedSearch = search?.trim();

  return db.user.findMany({
    where: {
      organizationId,
      deletedAt: null,
      role: "GUARDIAN",
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
      guardianProfile: {
        select: {
          id: true,
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  studentId: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
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

export async function getGuardianById(
  organizationId: string,
  guardianId: string,
) {
  return db.user.findFirst({
    where: {
      id: guardianId,
      organizationId,
      deletedAt: null,
      role: "GUARDIAN",
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
      guardianProfile: {
        select: {
          id: true,
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  studentId: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  branchId: true,
                  status: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });
}

export async function findUserByEmail(
  email: string,
) {
  return db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      organizationId: true,
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

export async function findStudents(
  organizationId: string,
  branchId: string,
  studentIds: string[],
) {
  return db.student.findMany({
    where: {
      id: {
        in: studentIds,
      },
      organizationId,
      branchId,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      branchId: true,
      status: true,
    },
  });
}

export async function createGuardian(data: {
  organizationId: string;
  branchId: string;
  code: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  password: string;
  createdById: string;
  students: {
    studentId: string;
    relationship: string | null;
  }[];
}) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        code: data.code,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "GUARDIAN",
        status: "ACTIVE",
        emailVerified: false,
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

    const guardian = await tx.guardianProfile.create({
      data: {
        userId: user.id,
        organizationId: data.organizationId,
      },
      select: {
        id: true,
      },
    });

    await tx.guardianStudent.createMany({
      data: data.students.map((student) => ({
        guardianId: guardian.id,
        studentId: student.studentId,
        relationship: student.relationship,
      })),
    });

    return user;
  });
}

export async function updateGuardian(
  organizationId: string,
  guardianId: string,
  data: {
    branchId: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    updatedById: string;
    students: {
      studentId: string;
      relationship: string | null;
    }[];
  },
) {
  return db.$transaction(async (tx) => {
    const guardian = await tx.user.findFirst({
      where: {
        id: guardianId,
        organizationId,
        deletedAt: null,
        role: "GUARDIAN",
      },
      select: {
        id: true,
        guardianProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!guardian || !guardian.guardianProfile) {
      return null;
    }

    await tx.user.update({
      where: {
        id: guardian.id,
      },
      data: {
        branchId: data.branchId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        updatedById: data.updatedById,
      },
    });

    await tx.guardianStudent.deleteMany({
      where: {
        guardianId: guardian.guardianProfile.id,
      },
    });

    await tx.guardianStudent.createMany({
      data: data.students.map((student) => ({
        guardianId: guardian.guardianProfile!.id,
        studentId: student.studentId,
        relationship: student.relationship,
      })),
    });

    return tx.user.findUnique({
      where: {
        id: guardian.id,
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
        updatedAt: true,
      },
    });
  });
}

export async function updateGuardianStatus(
  organizationId: string,
  guardianId: string,
  status: "ACTIVE" | "SUSPENDED",
  updatedById: string,
) {
  return db.user.updateMany({
    where: {
      id: guardianId,
      organizationId,
      deletedAt: null,
      role: "GUARDIAN",
    },
    data: {
      status,
      updatedById,
    },
  });
}

export async function softDeleteGuardian(
  organizationId: string,
  guardianId: string,
  updatedById: string,
) {
  return db.user.updateMany({
    where: {
      id: guardianId,
      organizationId,
      deletedAt: null,
      role: "GUARDIAN",
    },
    data: {
      email: `deleted+${guardianId}@deleted.local`,
      deletedAt: new Date(),
      status: "SUSPENDED",
      updatedById,
    },
  });
}

export async function getGuardianManagementStudents(
  organizationId: string,
  branchId?: string,
) {
  return db.student.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: "ACTIVE",
      ...(branchId ? { branchId } : {}),
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      branchId: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
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
