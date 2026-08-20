import { db } from "@/lib/db";

import type {
  CreateCourseRepositoryData,
  UpdateCourseRepositoryData,
} from "../types";

export class CourseRepository {
  static async create(
    data: CreateCourseRepositoryData,
  ) {
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

        startDate: data.startDate
          ? new Date(data.startDate)
          : null,

        endDate: data.endDate
          ? new Date(data.endDate)
          : null,

        createdById: data.createdById,
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

  static async findAvailableForStudent(
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.course.findMany({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        status: "ACTIVE",
        deletedAt: null,
      },

      include: {
        enrollments: {
          where: {
            studentId,
          },
          select: {
            id: true,
            status: true,
            progress: true,
            enrolledAt: true,
          },
        },

        _count: {
          select: {
            enrollments: {
              where: {
                status: {
                  in: ["ACTIVE", "SUSPENDED"],
                },
              },
            },
          },
        },
      },

      orderBy: [
        {
          startDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
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
    branchId: string | null,
    data: UpdateCourseRepositoryData,
  ) {
    const {
      updatedById,
      startDate,
      endDate,
      ...courseData
    } = data;

    return db.course.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId ? { branchId } : { branchId: null }),
        deletedAt: null,
      },

      data: {
        ...courseData,

        startDate: startDate
          ? new Date(startDate)
          : startDate === ""
            ? null
            : undefined,

        endDate: endDate
          ? new Date(endDate)
          : endDate === ""
            ? null
            : undefined,

        updatedById,
      },
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId: string | null,
    updatedById: string,
  ) {
    return db.course.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId ? { branchId } : { branchId: null }),
        deletedAt: null,
      },

      data: {
        deletedAt: new Date(),
        updatedById,
      },
    });
  }

  static async count(
    organizationId: string,
    branchId?: string,
  ) {
    return db.course.count({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
    });
  }
}
