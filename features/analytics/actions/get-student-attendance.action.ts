"use server";

import { auth } from "@/auth";
import { AttendanceReportsService } from "../services/attendance-reports.service";

export async function getStudentAttendanceAction(
  studentId: string,
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
      report: null,
    };
  }

  const report =
    await AttendanceReportsService.getStudentHistory(
      session.user.organizationId,
      session.user.branchId ?? undefined,
      studentId,
    );

  return {
    success: Boolean(report),
    message: report
      ? "Student attendance loaded."
      : "Student not found.",
    report,
  };
}
