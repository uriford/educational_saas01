import { NextResponse } from "next/server";

import {
  requireAdmin,
  requireActiveOrganizationAccess,
} from "@/features/auth/authorization";

import {
  AttendanceReportsService,
} from "@/features/analytics/services/attendance-reports.service";

export async function GET(
  request: Request,
) {
  try {
    /*
     * ========================================================
     * AUTHENTICATION + ROLE
     * ========================================================
     *
     * Only:
     *   SUPER_ADMIN
     *   ORGANIZATION_ADMIN
     *   BRANCH_ADMIN
     *
     * may export attendance.
     */
    const session = await requireAdmin();

    /*
     * ========================================================
     * TENANT AUTHORIZATION + SUBSCRIPTION
     * ========================================================
     *
     * SUPER_ADMIN:
     *   Must have an explicit organization context.
     *
     * ORGANIZATION_ADMIN:
     *   Organization-wide access.
     *
     * BRANCH_ADMIN:
     *   Organization + own branch.
     */
    const organizationId =
      session.user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization context required",
        },
        {
          status: 403,
        },
      );
    }

    await requireActiveOrganizationAccess(
      organizationId,
    );

    /*
     * ========================================================
     * BRANCH SCOPE
     * ========================================================
     *
     * Never trust branchId from the request.
     *
     * BRANCH_ADMIN is always restricted to the
     * branch encoded in the authenticated session.
     *
     * ORGANIZATION_ADMIN and SUPER_ADMIN may operate
     * organization-wide.
     *
     * For non-branched organizations, branchId remains
     * undefined and the report naturally operates at
     * organization scope.
     */
    const branchId =
      session.user.role === "BRANCH_ADMIN"
        ? session.user.branchId ?? undefined
        : undefined;

    if (
      session.user.role === "BRANCH_ADMIN" &&
      !branchId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch context required",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ========================================================
     * QUERY FILTERS
     * ========================================================
     */
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

    /*
     * IMPORTANT:
     *
     * branchId is intentionally NOT read from
     * searchParams.
     *
     * This prevents:
     *
     * /export?branchId=OTHER_BRANCH
     *
     * from allowing a Branch Admin to escape
     * their own branch.
     */
    const reports =
      await AttendanceReportsService.getReports({
        organizationId,
        branchId,
        period,
        search,
        courseId,
        teacherId,
        status:
          status as
            | "PRESENT"
            | "ABSENT"
            | "LATE"
            | "EXCUSED"
            | undefined,
      });

    /*
     * ========================================================
     * CSV GENERATION
     * ========================================================
     */
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

        `${record.student.firstName} ${
          record.student.lastName ?? ""
        }`.trim(),

        `${record.classSession.course.code} - ${
          record.classSession.course.name
        }`,

        `${record.classSession.teacher.firstName} ${
          record.classSession.teacher.lastName ?? ""
        }`.trim(),

        record.classSession.startTime.toISOString(),

        record.status,

        record.notes ?? "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""',
            )}"`,
          )
          .join(","),
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="attendance-${period.toLowerCase()}.csv"`,
      },
    });
  } catch (error) {
    console.error(
      "ATTENDANCE EXPORT API ERROR:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to export attendance";

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (
      message === "Forbidden" ||
      message === "Subscription inactive" ||
      message ===
        "Organization access required"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to export attendance",
      },
      {
        status: 500,
      },
    );
  }
}
