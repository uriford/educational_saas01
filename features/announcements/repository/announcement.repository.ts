import { db } from "@/lib/db";

import type {
  CreateAnnouncementRepositoryData,
  UpdateAnnouncementData,
} from "../types";

export class AnnouncementRepository {
  static async create(
    data: CreateAnnouncementRepositoryData,
  ) {
    return db.announcement.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,

        title: data.title,
        content: data.content,
        status: data.status ?? "DRAFT",
        publishAt: data.publishAt,
        expiresAt: data.expiresAt,
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
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            content: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where,
        orderBy: [
          {
            publishAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limit,
      }),

      db.announcement.count({
        where,
      }),
    ]);

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async findPublishedForStudent(
    organizationId: string,
    branchId: string,
    limit = 10,
  ) {
    const now = new Date();

    return db.announcement.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: "PUBLISHED",
        OR: [
          {
            branchId: null,
          },
          {
            branchId,
          },
        ],
        AND: [
          {
            OR: [
              {
                publishAt: null,
              },
              {
                publishAt: {
                  lte: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                expiresAt: null,
              },
              {
                expiresAt: {
                  gt: now,
                },
              },
            ],
          },
        ],
      },
      orderBy: [
        {
          publishAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: limit,
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.announcement.findFirst({
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
    data: UpdateAnnouncementData,
  ) {
    return db.announcement.updateMany({
      where: {
        id,
        organizationId,
        branchId,
        deletedAt: null,
      },

      data,
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.announcement.updateMany({
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

static async findPublishedByIdForStudent(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    const now = new Date();

    return db.announcement.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
        status: "PUBLISHED",
        OR: [
          {
            publishAt: null,
          },
          {
            publishAt: {
              lte: now,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                expiresAt: null,
              },
              {
                expiresAt: {
                  gt: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                branchId: null,
              },
              {
                branchId,
              },
            ],
          },
        ],
      },
      include: {
        branch: true,
        organization: true,
      },
    });
  }

}