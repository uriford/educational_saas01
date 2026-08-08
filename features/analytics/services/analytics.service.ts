import { AnalyticsRepository } from "../repository/analytics.repository";

export class AnalyticsService {
  static async getOverview(
    organizationId: string,
    branchId?: string,
  ) {
    return AnalyticsRepository.getOverview(
      organizationId,
      branchId,
    );
  }
}