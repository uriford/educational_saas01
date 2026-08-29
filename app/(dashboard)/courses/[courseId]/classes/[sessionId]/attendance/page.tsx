import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/features/auth/roles";

import { AttendanceService } from "@/features/attendance/services/attendance.service";
import AttendanceManager from "@/features/attendance/components/AttendanceManager";

type Props = {
  params: Promise<{
    courseId: string;
    sessionId: string;
  }>;
};

export default async function AttendancePage({
  params,
}: Props) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    redirect("/login");
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const { courseId, sessionId } = await params;

  const result =
    await AttendanceService.getSessionAttendance(
      session.user.organizationId,
      sessionId,
      session.user.branchId,
    );

  if (!result.enabled) {
    redirect(
      `/courses/${courseId}/classes/${sessionId}/edit`,
    );
  }

  if (!result.session) {
    redirect(`/courses/${courseId}`);
  }

  if (result.session.courseId !== courseId) {
    redirect(`/courses/${courseId}`);
  }

  const students =
    result.session.course.enrollments.map(
      (enrollment) => ({
        id: enrollment.student.id,
        studentId: enrollment.student.studentId,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
      }),
    );

  return (
    <AttendanceManager
      classSessionId={sessionId}
      courseName={result.session.course.name}
      sessionTitle={result.session.title}
      students={students}
      existingAttendance={result.attendance.map(
        (record) => ({
          studentId: record.studentId,
          status: record.status,
          notes: record.notes,
        }),
      )}
    />
  );
}
