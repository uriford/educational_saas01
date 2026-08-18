import "server-only";

import { db } from "@/lib/db";

export class SubscriptionRepository {
  static async getCurrentByOrganizationId(
    organizationId: string,
  ) {
    return db.subscription.findFirst({
      where: {
        organizationId,
        status: {
          in: ["TRIAL", "ACTIVE"],
        },
      },
      orderBy: {
        endDate: "desc",
      },
    });
  }

  static async getLatestByOrganizationId(
    organizationId: string,
  ) {
    return db.subscription.findFirst({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getAllByOrganizationId(
    organizationId: string,
  ) {
    return db.subscription.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async markExpired(
    subscriptionId: string,
  ) {
    return db.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: "EXPIRED",
      },
    });
  }
}
