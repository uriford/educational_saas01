import { auth } from "@/auth";
import { AttendanceReportsService } from "@/features/analytics/services/attendance-reports.service";
import Link from "next/link";

type Props = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function StudentAttendancePage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const { studentId } = await params;

  const report =
    await AttendanceReportsService.getStudentHistory(
      session.user.organizationId,
      session.user.branchId ?? undefined,
      studentId,
    );

  if (!report) {
    return (
      <div className="rounded-xl border p-8 text-center">
        Student attendance report not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/analytics"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Analytics
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">
          {report.student.name}
        </h1>

        <p className="text-sm text-muted-foreground">
          {report.student.studentCode}
          {report.student.email
            ? ` · ${report.student.email}`
            : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          title="Attendance"
          value={`${report.summary.attendanceRate}%`}
        />
        <Metric
          title="Sessions"
          value={report.summary.total}
        />
        <Metric
          title="Present"
          value={report.summary.present}
        />
        <Metric
          title="Absent"
          value={report.summary.absent}
        />
        <Metric
          title="Late"
          value={report.summary.late}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">
            Attendance History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4">Date</th>
                <th className="p-4">Course</th>
                <th className="p-4">Session</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>

            <tbody>
              {report.history.map((record) => (
                <tr
                  key={record.id}
                  className="border-b last:border-0"
                >
                  <td className="p-4">
                    {record.classSession.startTime.toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    {record.classSession.course.code}
                    <div className="text-xs text-muted-foreground">
                      {record.classSession.course.name}
                    </div>
                  </td>

                  <td className="p-4">
                    {record.classSession.title}
                  </td>

                  <td className="p-4">
                    {record.classSession.teacher.firstName}{" "}
                    {record.classSession.teacher.lastName ?? ""}
                  </td>

                  <td className="p-4 font-medium">
                    {record.status}
                  </td>

                  <td className="p-4 text-muted-foreground">
                    {record.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}
