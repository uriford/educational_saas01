import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { EnrollmentService } from "@/features/enrollments/services/enrollment.service";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";
import StudentWelcome from "@/features/student-portal/components/StudentWelcome";
import StudentOverview from "@/features/student-portal/components/StudentOverview";

export default async function StudentPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== ROLES.STUDENT ||
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    redirect("/login");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold">
            Student profile not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account is authenticated, but no student
            profile is connected to it yet.
          </p>
        </div>
      </div>
    );
  }

  const [enrollments, sessions] = await Promise.all([
    EnrollmentService.getStudentEnrollments(
      student.id,
      session.user.organizationId,
      session.user.branchId,
    ),
    ClassSessionService.getStudentSessions(
      student.id,
      session.user.organizationId,
      session.user.branchId,
    ),
  ]);

  const now = new Date();

  const upcomingClasses = sessions.filter(
    (classSession) =>
      classSession.startTime >= now &&
      classSession.status !== "CANCELLED",
  );

  return (
    <div className="space-y-6">
      <StudentWelcome
        firstName={student.firstName}
        lastName={student.lastName ?? null}
        studentId={student.studentId}
        avatar={student.avatar ?? null}
      />

      <StudentOverview
        student={student}
        courseCount={enrollments.length}
        upcomingClassCount={upcomingClasses.length}
        upcomingClasses={upcomingClasses.slice(0, 3)}
      />
    </div>
  );
}
