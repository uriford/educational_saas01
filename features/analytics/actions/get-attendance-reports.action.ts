"use server";

import { auth } from "@/auth";
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
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
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
