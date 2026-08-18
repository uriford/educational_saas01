import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { AttendanceReportsService } from "@/features/analytics/services/attendance-reports.service";

export async function GET(
  request: Request,
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return new NextResponse(
      "Unauthorized",
      { status: 401 },
    );
  }

  const { searchParams } =
    new URL(request.url);

  const period =
    searchParams.get("period") === "MONTH"
      ? "MONTH"
      : "WEEK";

  const status =
    searchParams.get("status") || undefined;

  const search =
    searchParams.get("search") || undefined;

  const courseId =
    searchParams.get("courseId") || undefined;

  const teacherId =
    searchParams.get("teacherId") || undefined;

  const reports =
    await AttendanceReportsService.getReports({
      organizationId:
        session.user.organizationId,
      branchId:
        session.user.branchId ?? undefined,
      period,
      search,
      courseId,
      teacherId,
      status: status as
        | "PRESENT"
        | "ABSENT"
        | "LATE"
        | "EXCUSED"
        | undefined,
    });

  const rows = [
    [
      "Student ID",
      "Student",
      "Course",
      "Teacher",
      "Date",
      "Status",
      "Notes",
    ],
    ...reports.records.map((record) => [
      record.student.studentId,
      `${record.student.firstName} ${record.student.lastName ?? ""}`.trim(),
      `${record.classSession.course.code} - ${record.classSession.course.name}`,
      `${record.classSession.teacher.firstName} ${record.classSession.teacher.lastName ?? ""}`.trim(),
      record.classSession.startTime.toISOString(),
      record.status,
      record.notes ?? "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) =>
          `"${String(value).replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        `attachment; filename="attendance-${period.toLowerCase()}.csv"`,
    },
  });
}
