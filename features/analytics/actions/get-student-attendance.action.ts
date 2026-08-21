"use server";

import { requireActiveSubscription } from "@/features/auth/authorization";
import { AttendanceReportsService } from "../services/attendance-reports.service";

export async function getStudentAttendanceAction(
  studentId: string,
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
