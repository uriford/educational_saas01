import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { StudentDashboardService } from "@/features/student-portal/services/student-dashboard.service";
import StudentWelcome from "@/features/student-portal/components/StudentWelcome";
import StudentOverview from "@/features/student-portal/components/StudentOverview";

export default async function StudentPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== ROLES.STUDENT
  ) {
    redirect("/login");
  }

  if (!session.user.organizationId) {
    redirect("/student/explore-courses");
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

  const dashboard =
    await StudentDashboardService.getOverview({
      studentId: student.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    });

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
        courseCount={dashboard.totalCourses}
        upcomingClassCount={dashboard.upcomingClasses.length}
        upcomingClasses={dashboard.upcomingClasses.slice(0, 3)}
        pendingPayments={dashboard.pendingPayments}
        enrollmentRequests={dashboard.enrollmentRequests}
      />
    </div>
  );
}
