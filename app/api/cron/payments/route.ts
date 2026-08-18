import { NextResponse } from "next/server";

import { PaymentSchedulerService } from "@/features/payments/services/payment-scheduler.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
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

  try {
    const result =
      await PaymentSchedulerService.syncPaymentStatuses();

    return NextResponse.json({
      success: true,
      message: "Payment scheduler completed successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Payment cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Payment scheduler failed.",
      },
      {
        status: 500,
      },
    );
  }
}
