"use server";

import { auth } from "@/auth";

import { AttendanceAnalyticsService } from "../services/attendance-analytics.service";

import type { AttendanceAnalyticsPeriod } from "../types/attendance";

export async function getAttendanceAnalyticsAction(
  period: AttendanceAnalyticsPeriod,
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
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
