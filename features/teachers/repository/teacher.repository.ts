import { db } from "@/lib/db";

import type {
  CreateTeacherData,
  CreateTeacherRepositoryData,
} from "../types";

export class TeacherRepository {
  static async create(data: CreateTeacherRepositoryData) {
    return db.$transaction(async (tx) => {
      // Prevent two simultaneous teacher creations
      // from initializing/updating the same organization counter
      // at the same time.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${data.organizationId})
        )
      `;

      const existingCounter =
        await tx.teacherIdCounter.findUnique({
          where: {
            organizationId: data.organizationId,
          },
        });

      let teacherNumber: number;

      if (existingCounter) {
        teacherNumber = existingCounter.nextNumber;

        await tx.teacherIdCounter.update({
          where: {
            organizationId: data.organizationId,
          },
          data: {
            nextNumber: {
              increment: 1,
            },
          },
        });
      } else {
        const lastTeacher =
          await tx.teacher.findFirst({
            where: {
              organizationId: data.organizationId,
              teacherId: {
                startsWith: "TCH-",
              },
            },
            orderBy: {
              teacherId: "desc",
            },
            select: {
              teacherId: true,
            },
          });

        const lastNumber = lastTeacher
          ? Number(
              lastTeacher.teacherId.replace("TCH-", ""),
            )
          : 0;

        teacherNumber = lastNumber + 1;

        await tx.teacherIdCounter.create({
          data: {
            organizationId: data.organizationId,
            nextNumber: teacherNumber + 1,
          },
        });
      }

      const teacherId = `TCH-${String(
        teacherNumber,
      ).padStart(6, "0")}`;

      return tx.teacher.create({
        data: {
          ...data,
          teacherId,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : null,
        },
      });
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
            teacherId: {
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
          {
            designation: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      db.teacher.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      db.teacher.count({
        where,
      }),
    ]);

    return {
      teachers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getStatistics(
    organizationId: string,
    branchId?: string,
  ) {
    const where = {
      organizationId,
      ...(branchId && { branchId }),
      deletedAt: null,
    };

    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      total,
      active,
      inactive,
      onLeave,
      resigned,
      newThisMonth,
    ] = await Promise.all([
      db.teacher.count({
        where,
      }),

      db.teacher.count({
        where: {
          ...where,
          status: "ACTIVE",
        },
      }),

      db.teacher.count({
        where: {
          ...where,
          status: "INACTIVE",
        },
      }),

      db.teacher.count({
        where: {
          ...where,
          status: "ON_LEAVE",
        },
      }),

      db.teacher.count({
        where: {
          ...where,
          status: "RESIGNED",
        },
      }),

      db.teacher.count({
        where: {
          ...where,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      onLeave,
      resigned,
      newThisMonth,
    };
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.teacher.findFirst({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      include: {
        organization: true,
        branch: true,
      },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    branchId?: string,
    data: Partial<CreateTeacherData> = {},
  ) {
    return db.teacher.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      data: {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : undefined,
      },
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.teacher.updateMany({
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
}