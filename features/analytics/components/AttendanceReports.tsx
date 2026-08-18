"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  Download,
  Filter,
  History,
  RotateCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getAttendanceReportsAction } from "../actions/get-attendance-reports.action";

type ReportData = Awaited<
  ReturnType<typeof getAttendanceReportsAction>
>["reports"];

type FilterOptions = {
  courses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  teachers: Array<{
    id: string;
    teacherId: string;
    name: string;
  }>;
};

type Props = {
  initialReports: NonNullable<ReportData>;
  filterOptions: FilterOptions;
};

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

export default function AttendanceReports({
  initialReports,
  filterOptions,
}: Props) {
  const [reports, setReports] =
    useState(initialReports);

  const [period, setPeriod] =
    useState<"WEEK" | "MONTH">("WEEK");

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<AttendanceStatus | "">("");

  const [courseId, setCourseId] =
    useState("");

  const [teacherId, setTeacherId] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  function applyFilters() {
    startTransition(async () => {
      const result =
        await getAttendanceReportsAction({
          period,
          search: search.trim() || undefined,
          status: status || undefined,
          courseId: courseId || undefined,
          teacherId: teacherId || undefined,
        });

      if (result.success && result.reports) {
        setReports(result.reports);
      }
    });
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCourseId("");
    setTeacherId("");
    setPeriod("WEEK");

    startTransition(async () => {
      const result =
        await getAttendanceReportsAction({
          period: "WEEK",
        });

      if (result.success && result.reports) {
        setReports(result.reports);
      }
    });
  }

  const exportParams = new URLSearchParams({
    period,
  });

  if (search.trim()) {
    exportParams.set(
      "search",
      search.trim(),
    );
  }

  if (status) {
    exportParams.set("status", status);
  }

  if (courseId) {
    exportParams.set("courseId", courseId);
  }

  if (teacherId) {
    exportParams.set("teacherId", teacherId);
  }

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <div>
            <h2 className="font-semibold">
              Report Filters
            </h2>

            <p className="text-xs text-muted-foreground">
              Filter attendance data by period, student,
              course, teacher, or status.
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* SEARCH */}
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters();
                  }
                }}
                placeholder="Search student name or ID..."
                className="pl-9"
              />
            </div>

            {/* PERIOD */}
            <select
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value as
                    | "WEEK"
                    | "MONTH",
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="WEEK">
                This week
              </option>

              <option value="MONTH">
                This month
              </option>
            </select>

            {/* COURSE */}
            <select
              value={courseId}
              onChange={(event) =>
                setCourseId(event.target.value)
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                All courses
              </option>

              {filterOptions.courses.map(
                (course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code} — {course.name}
                  </option>
                ),
              )}
            </select>

            {/* TEACHER */}
            <select
              value={teacherId}
              onChange={(event) =>
                setTeacherId(event.target.value)
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                All teachers
              </option>

              {filterOptions.teachers.map(
                (teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.teacherId} —{" "}
                    {teacher.name}
                  </option>
                ),
              )}
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | AttendanceStatus
                    | "",
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                All statuses
              </option>

              <option value="PRESENT">
                Present
              </option>

              <option value="ABSENT">
                Absent
              </option>

              <option value="LATE">
                Late
              </option>

              <option value="EXCUSED">
                Excused
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              disabled={isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button
              type="button"
              onClick={applyFilters}
              disabled={isPending}
            >
              <Filter className="mr-2 h-4 w-4" />

              {isPending
                ? "Loading..."
                : "Apply Filters"}
            </Button>

            <a
              href={`/api/analytics/attendance/export?${exportParams.toString()}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          title="Records"
          value={reports.summary.total}
        />

        <Metric
          title="Present"
          value={reports.summary.present}
        />

        <Metric
          title="Absent"
          value={reports.summary.absent}
        />

        <Metric
          title="Late"
          value={reports.summary.late}
        />

        <Metric
          title="Attendance"
          value={`${reports.summary.attendanceRate}%`}
        />
      </div>

      {/* STUDENTS */}
      <ReportSection
        title="Student Attendance Analysis"
        description="Attendance performance for students within the selected period."
      >
        {reports.students.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4">
                    Student
                  </th>

                  <th className="p-4 text-right">
                    Sessions
                  </th>

                  <th className="p-4 text-right">
                    Present
                  </th>

                  <th className="p-4 text-right">
                    Absent
                  </th>

                  <th className="p-4 text-right">
                    Late
                  </th>

                  <th className="p-4 text-right">
                    Excused
                  </th>

                  <th className="p-4 text-right">
                    Attendance
                  </th>

                  <th className="p-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {reports.students.map(
                  (student) => (
                    <tr
                      key={student.studentId}
                      className="border-b last:border-0"
                    >
                      <td className="p-4">
                        <div className="font-medium">
                          {student.studentName}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {student.studentCode}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        {student.totalSessions}
                      </td>

                      <td className="p-4 text-right">
                        {student.present}
                      </td>

                      <td className="p-4 text-right">
                        {student.absent}
                      </td>

                      <td className="p-4 text-right">
                        {student.late}
                      </td>

                      <td className="p-4 text-right">
                        {student.excused}
                      </td>

                      <td className="p-4 text-right">
                        <AttendanceRate
                          value={
                            student.attendanceRate
                          }
                        />
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/analytics/attendance/${student.studentId}`}
                          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <History className="mr-2 h-4 w-4" />
                          History
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* COURSES */}
      <ReportTable
        title="Course Attendance Reports"
        description="Attendance performance grouped by course."
        columns={[
          "Course",
          "Records",
          "Present",
          "Absent",
          "Late",
          "Excused",
          "Attendance",
        ]}
        rows={reports.courses.map(
          (course) => [
            `${course.courseCode} — ${course.courseName}`,
            course.totalRecords,
            course.present,
            course.absent,
            course.late,
            course.excused,
            `${course.attendanceRate}%`,
          ],
        )}
      />

      {/* TEACHERS */}
      <ReportTable
        title="Teacher Attendance Insights"
        description="Attendance records grouped by teacher."
        columns={[
          "Teacher",
          "Courses",
          "Records",
          "Present",
          "Absent",
          "Late",
          "Attendance",
        ]}
        rows={reports.teachers.map(
          (teacher) => [
            `${teacher.teacherCode} — ${teacher.teacherName}`,
            teacher.courseCount,
            teacher.totalRecords,
            teacher.present,
            teacher.absent,
            teacher.late,
            `${teacher.attendanceRate}%`,
          ],
        )}
      />
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

function AttendanceRate({
  value,
}: {
  value: number;
}) {
  const className =
    value < 75
      ? "text-red-600"
      : value >= 90
        ? "text-emerald-600"
        : "text-amber-600";

  return (
    <span
      className={`font-semibold ${className}`}
    >
      {value}%
    </span>
  );
}

function ReportSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function ReportTable({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <ReportSection
      title={title}
      description={description}
    >
      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map(
                  (column, index) => (
                    <th
                      key={column}
                      className={
                        index === 0
                          ? "p-4"
                          : "p-4 text-right"
                      }
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b last:border-0"
                >
                  {row.map(
                    (value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={
                          cellIndex === 0
                            ? "p-4"
                            : "p-4 text-right"
                        }
                      >
                        {value}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportSection>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <p className="font-medium">
        No attendance records found
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        Try changing the filters or selecting a
        different period.
      </p>
    </div>
  );
}
