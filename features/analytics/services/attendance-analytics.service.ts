import { AttendanceAnalyticsRepository } from "../repository/attendance-analytics.repository";

import type { AttendanceAnalyticsPeriod } from "../types/attendance";

export class AttendanceAnalyticsService {
  static async getAnalytics(
    organizationId: string,
    branchId: string | undefined,
    period: AttendanceAnalyticsPeriod = "WEEK",
  ) {
    return AttendanceAnalyticsRepository.getAnalytics(
      organizationId,
      branchId,
      period,
    );
  }
}
