import { db } from "@/lib/db";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "ANNOUNCEMENT"
  | "COURSE"
  | "STUDENT"
  | "TEACHER"
  | "SYSTEM";

type AdminNotificationScope = {
  organizationId: string;
  branchId?: string | null;
  actorId?: string | null;
};

type NotifyAdminsInput = AdminNotificationScope & {
  type?: NotificationType;
  title: string;
  message: string;
  href?: string;
  dedupeKey: string;
};

type NotifyStudentInput = {
  studentId: string;
  organizationId: string;
  type?: NotificationType;
  title: string;
  message: string;
  href?: string;
  dedupeKey: string;
};

export class NotificationAutomationService {
  /**
   * Notify organization/branch administrators.
   */
  static async notifyAdmins(
    input: NotifyAdminsInput,
  ) {
    const users = await db.user.findMany({
      where: {
        organizationId: input.organizationId,
        role: {
          in: [
            "ORGANIZATION_ADMIN",
            "BRANCH_ADMIN",
          ],
        },
        status: "ACTIVE",
        deletedAt: null,

        ...(input.actorId
          ? {
              id: {
                not: input.actorId,
              },
            }
          : {}),

        ...(input.branchId
          ? {
              OR: [
                {
                  role: "ORGANIZATION_ADMIN",
                },
                {
                  role: "BRANCH_ADMIN",
                  branchId: input.branchId,
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return [];
    }

    const results = [];

    for (const user of users) {
      const recipientDedupeKey =
        `${input.dedupeKey}:${user.id}`;

      const notification =
        await db.notification.upsert({
          where: {
            dedupeKey: recipientDedupeKey,
          },
          create: {
            organizationId:
              input.organizationId,
            userId: user.id,
            type: input.type ?? "SYSTEM",
            title: input.title,
            message: input.message,
            href: input.href,
            dedupeKey:
              recipientDedupeKey,
          },
          update: {},
        });

      results.push(notification);
    }

    return results;
  }

  /**
   * Notify the student account associated with a Student record.
   *
   * The Student model has an optional userId relation.
   * If the student does not have a linked User account,
   * no in-app notification is created.
   */
  static async notifyStudent(
    input: NotifyStudentInput,
  ) {
    const student =
      await db.student.findFirst({
        where: {
          id: input.studentId,
          organizationId:
            input.organizationId,
          deletedAt: null,
        },
        select: {
          userId: true,
        },
      });

    if (!student?.userId) {
      return null;
    }

    const user =
      await db.user.findFirst({
        where: {
          id: student.userId,
          organizationId:
            input.organizationId,
          role: "STUDENT",
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      return null;
    }

    return db.notification.upsert({
      where: {
        dedupeKey: input.dedupeKey,
      },
      create: {
        organizationId:
          input.organizationId,
        userId: user.id,
        type: input.type ?? "INFO",
        title: input.title,
        message: input.message,
        href: input.href,
        dedupeKey: input.dedupeKey,
      },
      update: {},
    });
  }
}
