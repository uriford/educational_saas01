"use server";

import { requireActiveSubscription } from "@/features/auth/authorization";
import { AttendanceReportsService } from "../services/attendance-reports.service";

type Params = {
  period?: "WEEK" | "MONTH";
  search?: string;
  courseId?: string;
  teacherId?: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
};

export async function getAttendanceReportsAction(
  params: Params,
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
      reports: null,
    };
  }

  const allowed = [
    "ORGANIZATION_ADMIN",
    "SUPER_ADMIN",
    "BRANCH_ADMIN",
  ];

  if (!allowed.includes(session.user.role)) {
    return {
      success: false,
      message: "You are not allowed to view attendance reports.",
      reports: null,
    };
  }

  const reports =
    await AttendanceReportsService.getReports({
      organizationId: session.user.organizationId,
      branchId:
        session.user.branchId ?? undefined,
      period: params.period ?? "WEEK",
      search: params.search?.trim() || undefined,
      courseId: params.courseId || undefined,
      teacherId: params.teacherId || undefined,
      status: params.status || undefined,
    });

  return {
    success: true,
    message: "Attendance reports loaded.",
    reports,
  };
}
