import { db } from "@/lib/db";

import type { CreateTeacherData, CreateTeacherRepositoryData } from "../types";

export class TeacherRepository {
static async create(data: CreateTeacherRepositoryData) {
  return db.teacher.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null,
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
    branchId: string,
    data: Partial<CreateTeacherData>,
  ) {
    return db.teacher.updateMany({
      where: {
        id,
        organizationId,
        branchId,
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

  static async count() {
    return db.teacher.count({
      where: {
        deletedAt: null,
      },
    });
  }
}