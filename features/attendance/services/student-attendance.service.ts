import "server-only";

import { StudentAttendanceRepository } from "../repository/student-attendance.repository";

export class StudentAttendanceService {
  static async getReport(
    organizationId: string,
    studentId: string,
    branchId?: string,
  ) {
    const organization = await dbOrganizationSettings(
      organizationId,
    );

    if (!organization?.settings?.attendanceEnabled) {
      return {
        enabled: false,
        report: null,
      };
    }

    const report =
      await StudentAttendanceRepository.getReport(
        organizationId,
        studentId,
        branchId,
      );

    return {
      enabled: true,
      report,
    };
  }
}

async function dbOrganizationSettings(
  organizationId: string,
) {
  const { db } = await import("@/lib/db");

  return db.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
    },
    include: {
      settings: true,
    },
  });
}
