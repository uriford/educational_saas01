import webpush from "web-push";

import { db } from "@/lib/db";

const publicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const privateKey =
  process.env.VAPID_PRIVATE_KEY;

const subject =
  process.env.VAPID_SUBJECT;

if (
  publicKey &&
  privateKey &&
  subject
) {
  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey,
  );
}

export type PushPayload = {
  title: string;
  message: string;
  href?: string;
  notificationId?: string;
};

export class PushNotificationService {
  static async sendToUser(
    userId: string,
    payload: PushPayload,
  ) {
    if (
      !publicKey ||
      !privateKey ||
      !subject
    ) {
      console.warn(
        "Web Push is not configured.",
      );

      return [];
    }

    const subscriptions =
      await db.pushSubscription.findMany({
        where: {
          userId,
        },
      });

    const results = [];

    for (const subscription of subscriptions) {
      try {
        const result =
          await webpush.sendNotification(
            {
              endpoint:
                subscription.endpoint,

              keys: {
                p256dh:
                  subscription.p256dh,
                auth:
                  subscription.auth,
              },
            },
            JSON.stringify(payload),
          );

        results.push(result);
      } catch (error: unknown) {
        console.error(
          "WEB PUSH SEND ERROR:",
          error,
        );

        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : undefined;

        // Subscription expired/revoked.
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.delete({
            where: {
              id: subscription.id,
            },
          });
        }
      }
    }

    return results;
  }
}
