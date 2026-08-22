import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { EnrollmentService } from "@/features/enrollments/services/enrollment.service";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";

import StudentScheduleBoard from "@/features/schedule/components/StudentScheduleBoard";

export default async function StudentSchedulePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/student-pending");
  }

  const organizationId = session.user.organizationId;
  const branchId = session.user.branchId ?? undefined;

  if (!branchId) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Schedule
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your schedule will appear after you are enrolled into a course.
          </p>
        </section>
      </div>
    );
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    organizationId,
    branchId,
  );

  if (!student) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Schedule
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your student profile could not be found.
          </p>
        </section>
      </div>
    );
  }

  const [enrollments, sessions] = await Promise.all([
    EnrollmentService.getStudentEnrollments(
      student.id,
      organizationId,
      branchId,
    ),

    ClassSessionService.getStudentSessions(
      student.id,
      organizationId,
      branchId,
    ),
  ]);

  const courses = enrollments
    .filter((enrollment) => enrollment.status === "ACTIVE")
    .map((enrollment) => ({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const serializedSessions = sessions.map((item) => ({
    id: item.id,
    courseId: item.courseId,
    title: item.title,
    description: item.description,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    room: item.room,
    status: item.status,
    course: {
      code: item.course.code,
      name: item.course.name,
    },
    teacher: {
      firstName: item.teacher.firstName,
      lastName: item.teacher.lastName,
    },
  }));

  return (
    <StudentScheduleBoard
      sessions={serializedSessions}
      courses={courses}
    />
  );
}
