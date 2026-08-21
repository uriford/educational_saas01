"use server";

import { requireActiveSubscription } from "@/features/auth/authorization";

import { AttendanceAnalyticsService } from "../services/attendance-analytics.service";

import type { AttendanceAnalyticsPeriod } from "../types/attendance";

export async function getAttendanceAnalyticsAction(
  period: AttendanceAnalyticsPeriod,
) {
  let session;

  try {
    session = await requireActiveSubscription();
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unauthorized.",
      analytics: null,
    };
  }

  if (
    session.user.role !== "ORGANIZATION_ADMIN" &&
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "BRANCH_ADMIN"
  ) {
    return {
      success: false,
      message: "You are not allowed to view attendance analytics.",
      analytics: null,
    };
  }

  const analytics =
    await AttendanceAnalyticsService.getAnalytics(
      session.user.organizationId,
      session.user.branchId ?? undefined,
      period,
    );

  return {
    success: true,
    message: "Attendance analytics loaded.",
    analytics,
  };
}
