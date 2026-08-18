import "server-only";

import { SubscriptionRepository } from "../repository/subscription.repository";

export class SubscriptionService {
  static async getCurrent(
    organizationId: string,
  ) {
    if (!organizationId) {
      throw new Error("Organization ID is required.");
    }

    const subscription =
      await SubscriptionRepository.getCurrentByOrganizationId(
        organizationId,
      );

    if (!subscription) {
      return null;
    }

    const now = new Date();

    if (
      subscription.endDate &&
      subscription.endDate <= now
    ) {
      if (
        subscription.status === "TRIAL" ||
        subscription.status === "ACTIVE"
      ) {
        const expired =
          await SubscriptionRepository.markExpired(
            subscription.id,
          );

        return {
          subscription: expired,
          isActive: false,
          isTrial: false,
          isExpired: true,
          daysRemaining: 0,
        };
      }
    }

    const daysRemaining =
      subscription.endDate
        ? Math.max(
            0,
            Math.ceil(
              (subscription.endDate.getTime() -
                now.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null;

    return {
      subscription,
      isActive:
        subscription.status === "TRIAL" ||
        subscription.status === "ACTIVE",
      isTrial:
        subscription.status === "TRIAL",
      isExpired: false,
      daysRemaining,
    };
  }

  static async hasAccess(
    organizationId: string,
  ) {
    const current =
      await this.getCurrent(organizationId);

    return current?.isActive === true;
  }

  static async getLatest(
    organizationId: string,
  ) {
    if (!organizationId) {
      throw new Error("Organization ID is required.");
    }

    return SubscriptionRepository.getLatestByOrganizationId(
      organizationId,
    );
  }

  static async getHistory(
    organizationId: string,
  ) {
    if (!organizationId) {
      throw new Error("Organization ID is required.");
    }

    return SubscriptionRepository.getAllByOrganizationId(
      organizationId,
    );
  }
}
