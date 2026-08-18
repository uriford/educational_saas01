import { auth } from "@/auth";

import { AttendanceReportsService } from "@/features/analytics/services/attendance-reports.service";
import AttendanceReports from "@/features/analytics/components/AttendanceReports";

export default async function AttendanceReportsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const allowedRoles = [
    "SUPER_ADMIN",
    "ORGANIZATION_ADMIN",
    "BRANCH_ADMIN",
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <h1 className="text-lg font-semibold">
          Access denied
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          You are not allowed to view attendance reports.
        </p>
      </div>
    );
  }

  const [reports, filterOptions] =
    await Promise.all([
      AttendanceReportsService.getReports({
        organizationId:
          session.user.organizationId,
        branchId:
          session.user.branchId ?? undefined,
        period: "WEEK",
      }),

      AttendanceReportsService.getFilterOptions(
        session.user.organizationId,
        session.user.branchId ?? undefined,
      ),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Attendance Reports
        </h1>

        <p className="text-sm text-muted-foreground">
          Detailed attendance reports for students,
          courses, and teachers.
        </p>
      </div>

      <AttendanceReports
        initialReports={reports}
        filterOptions={filterOptions}
      />
    </div>
  );
}
