"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import { StudentAttendanceService } from "@/features/attendance/services/student-attendance.service";

export async function getGuardianAttendanceAction(
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

  if (session.user.role !== ROLES.GUARDIAN) {
    return {
      success: false,
      message: "Guardian access required.",
      report: null,
    };
  }

  const student = await GuardianService.getChild(
    session.user.id,
    session.user.organizationId,
    studentId,
  );

  if (!student) {
    return {
      success: false,
      message: "Student is not linked to your guardian account.",
      report: null,
    };
  }

  const result = await StudentAttendanceService.getReport(
    session.user.organizationId,
    student.id,
    student.branchId ?? undefined,
  );

  if (!result.report) {
    return {
      success: false,
      message: result.enabled
        ? "Student attendance report not found."
        : "Attendance tracking is disabled.",
      report: null,
    };
  }

  return {
    success: true,
    message: "Attendance report loaded.",
    report: result.report,
  };
}
