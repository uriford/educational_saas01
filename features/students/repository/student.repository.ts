import { db } from "@/lib/db";
import type { CreateStudentData } from "../types";

export class StudentRepository {
  static async create(
    data: CreateStudentData & {
      studentId: string;
    },
  ) {
    return db.student.create({
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });
  }

  static async findById(id: string, organizationId: string, branchId?: string) {
    return db.student.findFirst({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        organization: true,
        branch: true,
        user: true,
      },
    });
  }

  static async findAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    const where = {
      organizationId,
      ...(branchId && { branchId }),
      deletedAt: null,

      ...(search && {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            studentId: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      db.student.count({
        where,
      }),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async delete(id: string, organizationId: string, branchId?: string) {
    return db.student.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async count(organizationId: string, branchId?: string) {
    return db.student.count({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
    });
  }
  static async findByUserId(
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.student.findFirst({
      where: {
        userId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        organization: true,
        branch: true,
        user: true,
      },
    });
  }
  static async findByEmail(email: string, organizationId: string) {
    const normalizedEmail = email.trim().toLowerCase();

    return db.student.findFirst({
      where: {
        email: normalizedEmail,
        organizationId,
        deletedAt: null,
      },
    });
  }

  static async generateStudentId() {
    const lastStudent = await db.student.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        studentId: true,
      },
    });

    if (!lastStudent) {
      return "STD-000001";
    }

    const lastNumber = Number(lastStudent.studentId.replace("STD-", ""));

    return `STD-${String(lastNumber + 1).padStart(6, "0")}`;
  }

  static async createWithGeneratedId(
    data: CreateStudentData,
    userData?: {
      code: string;
      password: string;
    },
  ) {
    const studentId = await this.generateStudentId();

    const normalizedEmail = data.email?.trim().toLowerCase() || null;

    return db.$transaction(async (tx) => {
      /*
       * Student.email uniqueness is scoped to the organization.
       *
       * The same email is allowed in different organizations,
       * but cannot be duplicated inside the same organization.
       */
      if (normalizedEmail) {
        const existingStudent = await tx.student.findFirst({
          where: {
            email: normalizedEmail,
            organizationId: data.organizationId,
            deletedAt: null,
          },
          select: {
            id: true,
            email: true,
            organizationId: true,
            deletedAt: true,
          },
        });

        if (existingStudent) {
          throw new Error("A student with this email already exists.");
        }
      }

      let userId: string | undefined;

      if (userData && normalizedEmail) {
        const existingUser = await tx.user.findUnique({
          where: {
            organizationId_email: {
              organizationId: data.organizationId,
              email: normalizedEmail,
            },
          },
          select: {
            id: true,
            email: true,
          },
        });

        if (existingUser) {
          throw new Error("A user account with this email already exists.");
        }

        const user = await tx.user.create({
          data: {
            code: userData.code,
            firstName: data.firstName,
            lastName: data.lastName || null,
            email: normalizedEmail,
            phone: data.phone || null,
            password: userData.password,
            role: "STUDENT",
            status: "ACTIVE",
            organizationId: data.organizationId,
            branchId: data.branchId,
            emailVerified: false,
          },
        });

        userId = user.id;
      }

      try {
        return await tx.student.create({
          data: {
            ...data,
            email: normalizedEmail,
            phone: data.phone || null,
            lastName: data.lastName || null,
            userId,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            studentId,
          },
        });
      } catch (error: unknown) {
        /*
         * Database-level race-condition protection.
         *
         * Even after the lookup above, another request could
         * theoretically insert the same email before this
         * transaction reaches student.create().
         */
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002"
        ) {
          throw new Error("A student with this email already exists.");
        }

        throw error;
      }
    });
  }

  static async updateOwnAvatar(
    id: string,
    userId: string,
    organizationId: string,
    branchId?: string,
    avatar: string = "",
  ) {
    return db.$transaction(async (tx) => {
      const studentResult = await tx.student.updateMany({
        where: {
          id,
          userId,
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
        data: {
          avatar,
        },
      });

      if (studentResult.count === 0) {
        return studentResult;
      }

      await tx.user.updateMany({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: {
          avatar,
        },
      });

      console.log("========== STUDENT + USER AVATAR UPDATE ==========");

      console.log({
        studentId: id,
        userId,
        organizationId,
        branchId,
        avatar,
        updatedStudentCount: studentResult.count,
      });

      return studentResult;
    });
  }
  static async removeOwnAvatar(
    id: string,
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.student.updateMany({
      where: {
        id,
        userId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      data: {
        avatar: null,
      },
    });
  }

  static async updateOwnProfile(
    id: string,
    userId: string,
    organizationId: string,
    data: {
      firstName: string;
      lastName?: string;
      phone?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      dateOfBirth?: string;
      address?: string;
      guardianName?: string;
      guardianPhone?: string;
      guardianEmail?: string;
    },
    branchId?: string,
  ) {
    return db.student.updateMany({
      where: {
        id,
        userId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        phone: data.phone || null,
        gender: data.gender ?? null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        guardianEmail: data.guardianEmail || null,
      },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    data: CreateStudentData,
  ) {
    return db.student.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      data: {
        ...data,

        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });
  }
  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.student.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  static async getStatistics(organizationId: string, branchId?: string) {
    const where = {
      organizationId,
      ...(branchId && { branchId }),
      deletedAt: null,
    };

    const now = new Date();

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStudents, activeStudents, inactiveStudents, newStudents] =
      await Promise.all([
        db.student.count({
          where,
        }),

        db.student.count({
          where: {
            ...where,
            status: "ACTIVE",
          },
        }),

        db.student.count({
          where: {
            ...where,
            status: "INACTIVE",
          },
        }),

        db.student.count({
          where: {
            ...where,
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        }),
      ]);

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      newStudents,
    };
  }
}
