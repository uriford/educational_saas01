"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { StudentAttendanceService } from "../services/student-attendance.service";

export async function getStudentAttendanceReportAction(
  studentId: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
      report: null,
    };
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      success: false,
      message:
        "You are not allowed to view student attendance reports.",
      report: null,
    };
  }

  const result =
    await StudentAttendanceService.getReport(
      session.user.organizationId,
      studentId,
      session.user.branchId ?? undefined,
    );

  if (!result.report) {
    return {
      success: false,
      message: result.enabled
        ? "Student not found."
        : "Attendance tracking is disabled.",
      report: null,
    };
  }

  return {
    success: true,
    message: "Student attendance report loaded.",
    report: result.report,
  };
}
