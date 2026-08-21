import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const body = await request.json();

  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const authKey = body?.keys?.auth;

  if (
    typeof endpoint !== "string" ||
    typeof p256dh !== "string" ||
    typeof authKey !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid push subscription.",
      },
      {
        status: 400,
      },
    );
  }

  const subscription =
    await db.pushSubscription.upsert({
      where: {
        endpoint,
      },

      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
      },

      update: {
        userId: session.user.id,
        p256dh,
        auth: authKey,
      },
    });

  return NextResponse.json({
    success: true,
    subscriptionId: subscription.id,
  });
}
