import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { CourseEnrollmentService } from "@/features/course-enrollments/services/course-enrollment.service";

import StudentCourseCard from "@/features/student-portal/components/StudentCourseCard";

export default async function StudentCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Student profile not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account is authenticated, but no student
            profile is connected to it yet.
          </p>
        </div>
      </div>
    );
  }

  const enrollments =
    await CourseEnrollmentService.getStudentCourses(
      student.id,
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              My Courses
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View your enrolled courses and learning progress.
            </p>
          </div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed bg-card">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>

            <h2 className="mt-4 font-semibold">
              No courses yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You are not enrolled in any courses yet. Your
              courses will appear here once you are enrolled.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {enrollments.map((enrollment) => (
            <StudentCourseCard
              key={enrollment.id}
              enrollment={enrollment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
