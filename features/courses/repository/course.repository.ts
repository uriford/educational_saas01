import { db } from "@/lib/db";

import type { CreateCourseRepositoryData, UpdateCourseData } from "../types";

export class CourseRepository {
  static async create(data: CreateCourseRepositoryData) {
    return db.course.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,

        code: data.code,
        name: data.name,
        description: data.description,
        duration: data.duration,
        fee: data.fee,
        capacity: data.capacity,
        status: data.status ?? "INACTIVE",

        startDate: data.startDate ? new Date(data.startDate) : null,

        endDate: data.endDate ? new Date(data.endDate) : null,
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
            code: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        orderBy: [
          {
            startDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limit,
      }),

      db.course.count({
        where,
      }),
    ]);

    return {
      courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async findById(id: string, organizationId: string, branchId?: string) {
    return db.course.findFirst({
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
    data: UpdateCourseData,
  ) {
    return db.course.updateMany({
      where: {
        id,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data: {
        ...data,

        startDate: data.startDate
          ? new Date(data.startDate)
          : data.startDate === ""
            ? null
            : undefined,

        endDate: data.endDate
          ? new Date(data.endDate)
          : data.endDate === ""
            ? null
            : undefined,
      },
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.course.updateMany({
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
    return db.course.count({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
    });
  }
}
