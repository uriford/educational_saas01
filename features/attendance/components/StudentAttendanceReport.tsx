"use client";

import { useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileClock,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Report = {
  student: {
    id: string;
    studentId: string;
    name: string;
  };

  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
    presentPercentage: number;
    absentPercentage: number;
    latePercentage: number;
    excusedPercentage: number;
  };

  courses: {
    courseId: string;
    courseCode: string;
    courseName: string;
    teacherName: string;
    totalSessions: number;
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  }[];

  trend: {
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    attendanceRate: number;
  }[];

  records: {
    id: string;
    status:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED";
    notes: string | null;
    markedAt: string;
    markedById: string | null;
    session: {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      room: string | null;
      status: string;
    };
    course: {
      id: string;
      code: string;
      name: string;
    };
    teacher: {
      id: string;
      teacherId: string;
      name: string;
    };
  }[];

  audits: {
    id: string;
    attendanceId: string;
    oldStatus:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED"
      | null;
    newStatus:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED";
    oldNotes: string | null;
    newNotes: string | null;
    changedById: string;
    changedAt: string;
    courseName: string;
    courseCode: string;
    sessionTitle: string;
    sessionStart: string;
  }[];
};

type Props = {
  report: Report;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function statusClass(status: string) {
  if (status === "PRESENT") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }

  if (status === "ABSENT") {
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  }

  if (status === "LATE") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
}

function exportCsv(
  rows: Report["records"],
  studentName: string,
) {
  const header = [
    "Date",
    "Course",
    "Course Code",
    "Session",
    "Teacher",
    "Status",
    "Room",
    "Notes",
    "Marked At",
    "Marked By",
  ];

  const data = rows.map((row) => [
    formatDate(row.session.startTime),
    row.course.name,
    row.course.code,
    row.session.title,
    row.teacher.name,
    row.status,
    row.session.room ?? "",
    row.notes ?? "",
    formatDateTime(row.markedAt),
    row.markedById ?? "",
  ]);

  const csv = [header, ...data]
    .map((row) =>
      row
        .map((value) =>
          `"${String(value).replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${studentName.replaceAll(" ", "-")}-attendance.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export default function StudentAttendanceReport({
  report,
}: Props) {
  const [courseFilter, setCourseFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const filteredRecords = useMemo(() => {
    return report.records.filter((record) => {
      if (
        courseFilter !== "ALL" &&
        record.course.id !== courseFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "ALL" &&
        record.status !== statusFilter
      ) {
        return false;
      }

      const date = record.session.startTime.slice(
        0,
        10,
      );

      if (dateFrom && date < dateFrom) {
        return false;
      }

      if (dateTo && date > dateTo) {
        return false;
      }

      return true;
    });
  }, [
    report.records,
    courseFilter,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>
              Attendance Report
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Detailed attendance history for{" "}
              <span className="font-medium">
                {report.student.name}
              </span>{" "}
              · {report.student.studentId}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              exportCsv(
                filteredRecords,
                report.student.name,
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Attendance Rate"
            value={`${report.summary.attendanceRate}%`}
            icon={TrendingUp}
          />

          <StatCard
            title="Present"
            value={String(report.summary.present)}
            detail={`${report.summary.presentPercentage}%`}
            icon={CheckCircle2}
          />

          <StatCard
            title="Absent"
            value={String(report.summary.absent)}
            detail={`${report.summary.absentPercentage}%`}
            icon={AlertCircle}
          />

          <StatCard
            title="Late"
            value={String(report.summary.late)}
            detail={`${report.summary.latePercentage}%`}
            icon={Clock3}
          />

          <StatCard
            title="Excused"
            value={String(report.summary.excused)}
            detail={`${report.summary.excusedPercentage}%`}
            icon={CalendarDays}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Attendance Trend
            </CardTitle>
          </CardHeader>

          <CardContent>
            {report.trend.length === 0 ? (
              <EmptyState text="No attendance trend data available yet." />
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={report.trend}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      }
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="present"
                      name="Present"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="absent"
                      name="Absent"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="late"
                      name="Late"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="excused"
                      name="Excused"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Course-by-Course Attendance
            </CardTitle>
          </CardHeader>

          <CardContent>
            {report.courses.length === 0 ? (
              <EmptyState text="No course attendance records found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3">
                        Course
                      </th>
                      <th className="px-3 py-3">
                        Teacher
                      </th>
                      <th className="px-3 py-3">
                        Sessions
                      </th>
                      <th className="px-3 py-3">
                        Present
                      </th>
                      <th className="px-3 py-3">
                        Absent
                      </th>
                      <th className="px-3 py-3">
                        Late
                      </th>
                      <th className="px-3 py-3">
                        Rate
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.courses.map((course) => (
                      <tr
                        key={course.courseId}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-3">
                          <div className="font-medium">
                            {course.courseName}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {course.courseCode}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          {course.teacherName || "—"}
                        </td>

                        <td className="px-3 py-3">
                          {course.totalSessions}
                        </td>

                        <td className="px-3 py-3">
                          {course.present}
                        </td>

                        <td className="px-3 py-3">
                          {course.absent}
                        </td>

                        <td className="px-3 py-3">
                          {course.late}
                        </td>

                        <td className="px-3 py-3 font-semibold">
                          {course.attendanceRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileClock className="h-5 w-5" />

              <CardTitle>
                Attendance History
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <select
                value={courseFilter}
                onChange={(event) =>
                  setCourseFilter(event.target.value)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="ALL">
                  All courses
                </option>

                {report.courses.map((course) => (
                  <option
                    key={course.courseId}
                    value={course.courseId}
                  >
                    {course.courseCode} ·{" "}
                    {course.courseName}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="ALL">
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

              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(event.target.value)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(event.target.value)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {filteredRecords.length} of{" "}
              {report.records.length} attendance records.
            </div>

            {filteredRecords.length === 0 ? (
              <EmptyState text="No attendance records match the selected filters." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3">
                        Date
                      </th>
                      <th className="px-3 py-3">
                        Course
                      </th>
                      <th className="px-3 py-3">
                        Session
                      </th>
                      <th className="px-3 py-3">
                        Teacher
                      </th>
                      <th className="px-3 py-3">
                        Status
                      </th>
                      <th className="px-3 py-3">
                        Room
                      </th>
                      <th className="px-3 py-3">
                        Notes
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          {formatDate(
                            record.session.startTime,
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium">
                            {record.course.name}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {record.course.code}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div>
                            {record.session.title}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              record.session.startTime,
                            ).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          {record.teacher.name ||
                            record.teacher.teacherId}
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          {record.session.room || "—"}
                        </td>

                        <td className="max-w-[220px] px-3 py-3 text-muted-foreground">
                          {record.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Correction & Audit History
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Changes made to previously recorded attendance.
            </p>
          </CardHeader>

          <CardContent>
            {report.audits.length === 0 ? (
              <EmptyState text="No attendance corrections have been made." />
            ) : (
              <div className="space-y-3">
                {report.audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">
                          {audit.courseName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {audit.courseCode} ·{" "}
                          {audit.sessionTitle}
                        </p>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(
                          audit.changedAt,
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          audit.oldStatus ?? "UNKNOWN",
                        )}`}
                      >
                        {audit.oldStatus ?? "—"}
                      </span>

                      <span className="text-muted-foreground">
                        →
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          audit.newStatus,
                        )}`}
                      >
                        {audit.newStatus}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      Changed by:{" "}
                      <span className="font-medium">
                        {audit.changedById}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail?: string;
  icon: typeof TrendingUp;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>

        {detail && (
          <p className="mt-1 text-xs text-muted-foreground">
            {detail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
