import { db } from "@/lib/db";

import type {
  CreateLessonRepositoryData,
  UpdateLessonRepositoryData,
} from "../types";

export class LessonRepository {
  static async create(
    data: CreateLessonRepositoryData,
  ) {
    const lastLesson = await db.lesson.findFirst({
      where: {
        courseId: data.courseId,
        organizationId: data.organizationId,
        branchId: data.branchId,
        deletedAt: null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const nextOrder =
      lastLesson ? lastLesson.order + 1 : 0;

    return db.lesson.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        courseId: data.courseId,

        title: data.title,
        description: data.description || null,
        content: data.content || null,

        type: data.type,
        status: "DRAFT",

        videoUrl: data.videoUrl || null,
        documentUrl: data.documentUrl || null,
        externalUrl: data.externalUrl || null,

        duration: data.duration ?? null,

        order: nextOrder,

        createdById: data.createdById,
      },
    });
  }

  static async findAll(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.lesson.findMany({
      where: {
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      orderBy: [
        {
          order: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });
  }

  static async findById(
    id: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.lesson.findFirst({
      where: {
        id,
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      include: {
        resources: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async update(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    data: UpdateLessonRepositoryData,
  ) {
    return db.lesson.updateMany({
      where: {
        id,
        courseId,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data: {
        title: data.title,
        description:
          data.description === ""
            ? null
            : data.description,

        content:
          data.content === ""
            ? null
            : data.content,

        type: data.type,

        videoUrl:
          data.videoUrl === ""
            ? null
            : data.videoUrl,

        documentUrl:
          data.documentUrl === ""
            ? null
            : data.documentUrl,

        externalUrl:
          data.externalUrl === ""
            ? null
            : data.externalUrl,

        duration: data.duration,

        updatedById: data.updatedById,
      },
    });
  }

  static async updateStatus(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    status:
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED",
    updatedById?: string,
  ) {
    return db.lesson.updateMany({
      where: {
        id,
        courseId,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data: {
        status,
        updatedById,
      },
    });
  }

  static async softDelete(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    updatedById?: string,
  ) {
    return db.lesson.updateMany({
      where: {
        id,
        courseId,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
        updatedById,
      },
    });
  }

  static async reorder(
    courseId: string,
    organizationId: string,
    branchId: string,
    lessonId: string,
    order: number,
  ) {
    return db.lesson.updateMany({
      where: {
        id: lessonId,
        courseId,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data: {
        order,
      },
    });
  }
}
