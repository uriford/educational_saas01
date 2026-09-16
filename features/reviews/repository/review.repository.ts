import "server-only";

import { db } from "@/lib/db";

export class ReviewRepository {
  static async getApprovedReviews(
    organizationId: string,
    take?: number,
  ) {
    return db.review.findMany({
      where: {
        organizationId,
        approved: true,
      },
      select: {
        id: true,
        authorType: true,
        type: true,
        rating: true,
        content: true,
        videoUrl: true,
        approved: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(take ? { take } : {}),
    });
  }

  static async getAllReviews(organizationId: string) {
    return db.review.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        authorType: true,
        type: true,
        rating: true,
        content: true,
        videoUrl: true,
        approved: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async setApproved(
    id: string,
    organizationId: string,
    approved: boolean,
  ) {
    return db.review.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        approved,
      },
    });
  }

  static async deleteReview(
    id: string,
    organizationId: string,
  ) {
    return db.review.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }

  static async getReviewEligibility(
    userId: string,
    organizationId: string,
  ) {
    const student = await db.student.findFirst({
      where: {
        userId,
        organizationId,
        courseEnrollments: {
          some: {
            course: {
              organizationId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (student) {
      return {
        eligible: true,
        authorType: "STUDENT" as const,
      };
    }

    const guardian = await db.guardianProfile.findFirst({
      where: {
        userId,
        organizationId,
        students: {
          some: {
            student: {
              organizationId,
              courseEnrollments: {
                some: {
                  course: {
                    organizationId,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (guardian) {
      return {
        eligible: true,
        authorType: "GUARDIAN" as const,
      };
    }

    return {
      eligible: false,
      authorType: null,
    };
  }

  static async createReview(data: {
    organizationId: string;
    userId: string;
    authorType: "STUDENT" | "GUARDIAN";
    type: "TEXT" | "VIDEO";
    rating: number;
    content?: string;
    videoUrl?: string;
  }) {
    return db.review.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        authorType: data.authorType,
        type: data.type,
        rating: data.rating,
        content: data.content,
        videoUrl: data.videoUrl,
      },
    });
  }
}
