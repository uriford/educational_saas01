import {
  AttendanceReportsRepository,
  type AttendanceReportFilters,
} from "../repository/attendance-reports.repository";

export class AttendanceReportsService {
  static getFilterOptions(
    organizationId: string,
    branchId?: string,
  ) {
    return AttendanceReportsRepository.getFilterOptions(
      organizationId,
      branchId,
    );
  }

  static getReports(filters: AttendanceReportFilters) {
    return AttendanceReportsRepository.getReports(filters);
  }

  static getStudentHistory(
    organizationId: string,
    branchId: string | undefined,
    studentId: string,
  ) {
    return AttendanceReportsRepository.getStudentHistory(
      organizationId,
      branchId,
      studentId,
    );
  }

  static getAuditHistory(
    organizationId: string,
    branchId: string | undefined,
    studentId?: string,
  ) {
    return AttendanceReportsRepository.getAuditHistory(
      organizationId,
      branchId,
      studentId,
    );
  }
}
