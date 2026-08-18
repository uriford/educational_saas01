import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

export default async function GuardianAttendancePage({
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
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance
        </h1>

        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No children linked</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No students are currently linked to your guardian account.
          </p>
        </div>
      </div>
    );
  }

  const selectedStudentId =
    studentId &&
    children.some(({ student }) => student.id === studentId)
      ? studentId
      : children[0].student.id;

  const report = await GuardianService.getChildAttendance(
    session.user.id,
    session.user.organizationId,
    selectedStudentId,
  );

  if (!report) {
    redirect("/guardian/attendance");
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your child&apos;s attendance and class participation.
        </p>
      </section>

      {children.length > 1 && (
        <section className="rounded-xl border bg-background p-5">
          <p className="mb-3 text-sm font-medium">Select child</p>

          <div className="flex flex-wrap gap-2">
            {children.map(({ student }) => {
              const name =
                `${student.firstName} ${student.lastName ?? ""}`.trim();

              const active = student.id === selectedStudentId;

              return (
                <a
                  key={student.id}
                  href={`/guardian/attendance?studentId=${student.id}`}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm font-medium",
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

      <section className="rounded-xl border bg-background p-5">
        <p className="text-sm text-muted-foreground">Student</p>
        <h2 className="mt-1 text-lg font-semibold">
          {report.student.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          ID: {report.student.studentId}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Attendance Rate
          </p>
          <p className="mt-2 text-3xl font-bold">
            {report.summary.attendanceRate}%
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Present</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {report.summary.present}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Absent</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {report.summary.absent}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Late</p>
          <p className="mt-2 text-3xl font-bold">
            {report.summary.late}
          </p>
        </div>
      </section>

      {report.courses.length > 0 && (
        <section className="rounded-xl border bg-background">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Attendance by Course</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Attendance performance across enrolled courses.
            </p>
          </div>

          <div className="divide-y">
            {report.courses.map((course) => (
              <div
                key={course.courseId}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium">
                    {course.courseName}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {course.courseCode}
                    {course.teacherName
                      ? ` · ${course.teacherName}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">
                      {course.attendanceRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.present + course.late} attended /{" "}
                      {course.totalRecords} records
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Recent Attendance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Attendance records for this student.
          </p>
        </div>

        {report.records.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold">No attendance records</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No attendance has been recorded yet.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {report.records.slice(0, 20).map((record) => {
              const statusClass =
                record.status === "PRESENT"
                  ? "bg-green-100 text-green-800"
                  : record.status === "ABSENT"
                    ? "bg-red-100 text-red-800"
                    : record.status === "LATE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800";

              return (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium">
                      {record.course.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {record.session.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(record.session.startTime))}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                  >
                    {record.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
