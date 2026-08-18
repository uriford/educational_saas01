"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { AttendanceService } from "../services/attendance.service";

type AttendanceRecord = {
  studentId: string;
  status:
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "EXCUSED";
  notes?: string | null;
};

export async function saveAttendanceAction(data: {
  classSessionId: string;
  records: AttendanceRecord[];
}) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
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
        "You are not allowed to manage attendance.",
    };
  }

  const result =
    await AttendanceService.saveAttendance(
      session.user.organizationId,
      session.user.branchId,
      data.classSessionId,
      session.user.id,
      data.records,
    );

  return result;
}
