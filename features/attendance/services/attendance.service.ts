import "server-only";

import { AttendanceRepository } from "../repository/attendance.repository";
import { StudentAttendanceRepository } from "../repository/student-attendance.repository";

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

export class AttendanceService {
  static async getSessionAttendance(
    organizationId: string,
    classSessionId: string,
    branchId?: string | null,
  ) {
    const organization = await AttendanceService.getOrganizationSettings(
      organizationId,
    );

    if (!organization?.settings?.attendanceEnabled) {
      return {
        enabled: false,
        session: null,
        attendance: [],
      };
    }

    const session = await AttendanceRepository.getSession(
      classSessionId,
      organizationId,
      branchId,
    );

    if (!session) {
      return {
        enabled: true,
        session: null,
        attendance: [],
      };
    }

    const attendance =
      await AttendanceRepository.getForSession(
        classSessionId,
        organizationId,
        branchId,
      );

    return {
      enabled: true,
      session,
      attendance,
    };
  }

  static async saveAttendance(
    organizationId: string,
    classSessionId: string,
    markedById: string,
    records: {
      studentId: string;
      status: AttendanceStatus;
      notes?: string | null;
    }[],
    branchId?: string | null,
  ) {
    const organization =
      await AttendanceService.getOrganizationSettings(
        organizationId,
      );

    if (!organization?.settings?.attendanceEnabled) {
      return {
        success: false,
        message:
          "Attendance tracking is disabled for this organization.",
      };
    }

    if (records.length === 0) {
      return {
        success: false,
        message: "No attendance records were provided.",
      };
    }

    const session =
      await AttendanceRepository.getSession(
        classSessionId,
        organizationId,
        branchId,
      );

    if (!session) {
      return {
        success: false,
        message: "Class session not found.",
      };
    }

    const enrolledStudentIds = new Set(
      session.course.enrollments.map(
        (enrollment) => enrollment.studentId,
      ),
    );

    const invalidStudent = records.find(
      (record) =>
        !enrolledStudentIds.has(record.studentId),
    );

    if (invalidStudent) {
      return {
        success: false,
        message:
          "One or more students are not enrolled in this course.",
      };
    }

    await StudentAttendanceRepository.saveManyWithAudit(
      organizationId,
      branchId,
      classSessionId,
      markedById,
      records,
    );

    return {
      success: true,
      message: "Attendance saved successfully.",
    };
  }

  private static async getOrganizationSettings(
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
}
