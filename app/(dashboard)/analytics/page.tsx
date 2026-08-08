import { auth } from "@/auth";

import { AnalyticsService } from "@/features/analytics/services/analytics.service";
import AnalyticsOverview from "@/features/analytics/components/AnalyticsOverview";
import AnalyticsCharts from "@/features/analytics/components/AnalyticsCharts";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const analytics = await AnalyticsService.getOverview(
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Analytics
        </h1>

        <p className="text-sm text-muted-foreground">
          Overview of your organization&apos;s activity.
        </p>
      </div>

      <AnalyticsOverview analytics={analytics} />

      <AnalyticsCharts analytics={analytics} />
    </div>
  );
}