import Link from "next/link";
import { FileText } from "lucide-react";

import { auth } from "@/auth";

import { AnalyticsService } from "@/features/analytics/services/analytics.service";
import AnalyticsOverview from "@/features/analytics/components/AnalyticsOverview";
import AnalyticsCharts from "@/features/analytics/components/AnalyticsCharts";

import { AttendanceAnalyticsService } from "@/features/analytics/services/attendance-analytics.service";
import AttendanceAnalyticsSection from "@/features/analytics/components/AttendanceAnalyticsSection";

type Props = {
  searchParams: Promise<{
    attendancePeriod?: string;
  }>;
};

export default async function AnalyticsPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const params = await searchParams;

  const attendancePeriod =
    params.attendancePeriod === "MONTH"
      ? "MONTH"
      : "WEEK";

  const organizationId =
    session.user.organizationId;

  const branchId = session.user.branchId;

  const analytics =
    await AnalyticsService.getOverview(
      organizationId,
      branchId ?? undefined,
    );

  const attendance =
    await AttendanceAnalyticsService.getAnalytics(
      organizationId,
      branchId ?? undefined,
      attendancePeriod,
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics
          </h1>

          <p className="text-sm text-muted-foreground">
            Overview of your organization&apos;s activity and
            attendance performance.
          </p>
        </div>

        <Link
          href="/analytics/attendance/reports"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <FileText className="h-4 w-4" />
          Attendance Reports
        </Link>
      </div>

      <AnalyticsOverview
        analytics={analytics}
      />

      <AnalyticsCharts
        analytics={analytics}
      />

      <AttendanceAnalyticsSection
        initialAnalytics={attendance}
      />
    </div>
  );
}
