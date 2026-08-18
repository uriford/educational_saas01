import "server-only";

import { db } from "@/lib/db";

export class PublicRepository {
  static async getOrganizationBySlug(slug: string) {
    return db.organization.findFirst({
      where: {
        slug,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        domain: true,
        logo: true,

        branches: {
          where: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            address: true,
            logo: true,
            isHeadquarters: true,
          },
          orderBy: {
            isHeadquarters: "desc",
          },
        },

        courses: {
          where: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            duration: true,
            fee: true,
            capacity: true,
            startDate: true,
            endDate: true,
          },
          orderBy: [
            {
              startDate: "asc",
            },
            {
              createdAt: "desc",
            },
          ],
          take: 6,
        },

        announcements: {
          where: {
            status: "PUBLISHED",
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 4,
        },

        classSessions: {
          where: {
            status: {
              in: ["SCHEDULED", "ONGOING"],
            },
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            room: true,

            course: {
              select: {
                id: true,
                name: true,
              },
            },

            teacher: {
              select: {
                teacherId: true,
                firstName: true,
                lastName: true,
                designation: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            startTime: "asc",
          },
          take: 6,
        },

        _count: {
          select: {
            students: true,
            teachers: true,
            courses: true,
          },
        },
      },
    });
  }
}
