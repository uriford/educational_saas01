"use server";

import {
  requireActiveSubscription,
  requireBranchAccess,
} from "@/features/auth/authorization";
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
  const session = await requireActiveSubscription();

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

  // SUPER_ADMIN is a separate platform-level authority.
  // Do not apply branch authorization to SUPER_ADMIN.
  if (session.user.role !== ROLES.SUPER_ADMIN) {
    const { db } = await import("@/lib/db");

    const organization = await db.organization.findFirst({
      where: {
        id: session.user.organizationId,
        deletedAt: null,
      },
      select: {
        hasBranches: true,
      },
    });

    // Only branched organizations require branch-level authorization.
    if (organization?.hasBranches) {
      if (!session.user.branchId) {
        return {
          success: false,
          message:
            "Branch access is required for this organization.",
        };
      }

      try {
        await requireBranchAccess(
          session.user.organizationId,
          session.user.branchId,
        );
      } catch {
        return {
          success: false,
          message:
            "You are not allowed to manage attendance for this branch.",
        };
      }
    }
  }

  const result =
    await AttendanceService.saveAttendance(
      session.user.organizationId,
      data.classSessionId,
      session.user.id,
      data.records,
      session.user.branchId,
    );

  return result;
}
