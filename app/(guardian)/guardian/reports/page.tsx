import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default async function GuardianReportsPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const { studentId } = await searchParams;

  const children = await GuardianService.getChildren(
    session.user.id,
    session.user.organizationId,
  );

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Consolidated academic performance reports.
          </p>
        </section>

        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">
            No children linked
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            No students are currently linked to your guardian
            account.
          </p>
        </div>
      </div>
    );
  }

  const selectedStudentId =
    studentId &&
    children.some(
      ({ student }) => student.id === studentId,
    )
      ? studentId
      : children[0].student.id;

  const report = await GuardianService.getChildReport(
    session.user.id,
    session.user.organizationId,
    selectedStudentId,
  );

  if (!report) {
    redirect("/guardian/reports");
  }

  const { student, results, progress } = report;

  const resultsSummary = results.summary ?? {
    averagePercentage: 0,
    passed: 0,
    total: 0,
  };

  const attendance = report.attendance as
    | {
        summary?: {
          total?: number;
          present?: number;
          absent?: number;
          late?: number;
          attendancePercentage?: number;
        };
      }
    | null;

  const attendanceSummary = attendance?.summary;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Reports
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Consolidated academic performance report.
        </p>
      </section>

      {children.length > 1 && (
        <section className="rounded-xl border bg-background p-5">
          <p className="mb-3 text-sm font-medium">
            Select child
          </p>

          <div className="flex flex-wrap gap-2">
            {children.map(({ student: child }) => {
              const name =
                `${child.firstName} ${child.lastName ?? ""}`.trim();

              const active = child.id === student.id;

              return (
                <a
                  key={child.id}
                  href={`/guardian/reports?studentId=${child.id}`}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  {name}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Student Performance Report
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {student.name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Student ID: {student.studentId}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {student.status}
            </span>

            <p className="mt-3 text-xs text-muted-foreground">
              Generated {formatDate(report.generatedAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Average Assessment
          </p>

          <p className="mt-2 text-3xl font-bold">
            {resultsSummary.averagePercentage}%
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Assessments Passed
          </p>

          <p className="mt-2 text-3xl font-bold">
            {resultsSummary.passed}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            of {resultsSummary.total} completed
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Attendance
          </p>

          <p className="mt-2 text-3xl font-bold">
            {attendanceSummary?.attendancePercentage ?? 0}%
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Learning Progress
          </p>

          <p className="mt-2 text-3xl font-bold">
            {progress.averageProgress}%
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Assessment Performance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recent assessment results for this student.
          </p>
        </div>

        {results.items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No completed assessments yet.
          </div>
        ) : (
          <div className="divide-y">
            {results.items.slice(0, 10).map((result) => (
              <div
                key={result.submissionId}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {result.title}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.course.name}
                    {result.course.code
                      ? ` · ${result.course.code}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Score
                    </p>

                    <p className="font-semibold">
                      {result.score} / {result.totalMarks}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Percentage
                    </p>

                    <p className="font-semibold">
                      {result.percentage}%
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-medium",
                      result.pendingManualGrading
                        ? "bg-yellow-100 text-yellow-800"
                        : result.passed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800",
                    ].join(" ")}
                  >
                    {result.pendingManualGrading
                      ? "Pending"
                      : result.passed
                        ? "Passed"
                        : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Course Progress
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Learning progress across active and completed courses.
          </p>
        </div>

        {progress.courses.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No course progress available.
          </div>
        ) : (
          <div className="divide-y">
            {progress.courses.map((course) => (
              <div
                key={course.enrollmentId}
                className="p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {course.course.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.course.code || "Course"}
                      {" · "}
                      {course.completedLessons} of{" "}
                      {course.totalLessons} lessons
                    </p>
                  </div>

                  <p className="font-semibold">
                    {course.progress}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${course.progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Attendance Summary
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Overall attendance information for this student.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Records
            </p>

            <p className="mt-1 text-xl font-semibold">
              {attendanceSummary?.total ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Present
            </p>

            <p className="mt-1 text-xl font-semibold">
              {attendanceSummary?.present ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Absent
            </p>

            <p className="mt-1 text-xl font-semibold">
              {attendanceSummary?.absent ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Late
            </p>

            <p className="mt-1 text-xl font-semibold">
              {attendanceSummary?.late ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-muted/30 p-5">
        <p className="text-sm font-medium">
          Report scope
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          This report combines assessment performance,
          attendance, and learning progress. It is read-only
          and only available for students explicitly linked to
          this guardian account.
        </p>
      </section>
    </div>
  );
}
