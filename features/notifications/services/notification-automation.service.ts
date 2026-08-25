import "server-only";

import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

type AdminNotificationScope = {
  organizationId: string;
  /**
   * null/undefined = organization-wide notification.
   *
   * A branch ID = notification is restricted to that branch's
   * branch administrators.
   */
  branchId?: string | null;

  /**
   * Optional actor to exclude from recipients.
   * Useful when the actor should not receive their own notification.
   */
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
   * Notify organization and/or branch administrators.
   *
   * Notification visibility rules:
   *
   * 1. branchId = null/undefined
   *    → organization-wide
   *    → Organization Admins + every Branch Admin
   *
   * 2. branchId = specific branch
   *    → branch-scoped
   *    → Organization Admins + Branch Admins of that branch
   *
   * 3. organizationId is always required
   *    → prevents cross-tenant notification leakage.
   */
  static async notifyAdmins(
    input: NotifyAdminsInput,
  ) {
    if (!input.organizationId) {
      throw new Error(
        "Notification organizationId is required.",
      );
    }

    if (!input.title.trim()) {
      throw new Error(
        "Notification title is required.",
      );
    }

    if (!input.message.trim()) {
      throw new Error(
        "Notification message is required.",
      );
    }

    if (!input.dedupeKey.trim()) {
      throw new Error(
        "Notification dedupeKey is required.",
      );
    }

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

        /**
         * Organization admins can see every notification
         * belonging to their organization.
         *
         * Branch admins only receive notifications belonging
         * to their own branch when a branchId is provided.
         *
         * When branchId is null/undefined, the notification is
         * organization-wide and therefore visible to every
         * administrator in the organization.
         */
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

    /**
     * The dedupe key is made recipient-specific.
     *
     * This allows the same logical notification to be delivered
     * independently to every eligible administrator.
     */
    return Promise.all(
      users.map(async (user) => {
        const recipientDedupeKey =
          `${input.dedupeKey}:${user.id}`;

        return db.notification.upsert({
          where: {
            dedupeKey: recipientDedupeKey,
          },

          create: {
            organizationId:
              input.organizationId,

            userId: user.id,

            type:
              input.type ?? "SYSTEM",

            title: input.title,
            message: input.message,
            href: input.href,

            dedupeKey:
              recipientDedupeKey,
          },

          /**
           * Intentionally do nothing when the same logical
           * notification has already been delivered.
           *
           * This prevents duplicate notifications when an
           * automation is retried.
           */
          update: {},
        });
      }),
    );
  }

  /**
   * Notify the student account associated with a Student record.
   *
   * Student.id and User.id are intentionally kept separate.
   * The caller must provide Student.id.
   */
  static async notifyStudent(
    input: NotifyStudentInput,
  ) {
    if (!input.organizationId) {
      throw new Error(
        "Notification organizationId is required.",
      );
    }

    if (!input.studentId) {
      throw new Error(
        "Notification studentId is required.",
      );
    }

    if (!input.title.trim()) {
      throw new Error(
        "Notification title is required.",
      );
    }

    if (!input.message.trim()) {
      throw new Error(
        "Notification message is required.",
      );
    }

    if (!input.dedupeKey.trim()) {
      throw new Error(
        "Notification dedupeKey is required.",
      );
    }

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

    /**
     * A student may exist without a login account.
     * In that case there is no User recipient for an
     * in-app notification.
     */
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

        type:
          input.type ?? "INFO",

        title: input.title,
        message: input.message,
        href: input.href,

        dedupeKey: input.dedupeKey,
      },

      update: {},
    });
  }
}
