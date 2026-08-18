import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { CourseService } from "@/features/courses/services/course.service";

import ExploreCourses from "@/features/student-portal/components/explore-courses/ExploreCourses";

export default async function ExploreCoursesPage() {
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
    redirect("/student");
  }

  const courses =
    await CourseService.getAvailableForStudent(
      student.id,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

  const availableCourses = courses.map((course) => ({
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    duration: course.duration,
    fee:
      course.fee === null
        ? null
        : Number(course.fee),
    capacity: course.capacity,
    enrolledCount: course._count.enrollments,
    status: course.status,
    enrollmentStatus:
      course.enrollments[0]?.status ?? null,
    enrolled: course.enrollments.some(
      (enrollment) =>
        enrollment.status === "ACTIVE" ||
        enrollment.status === "SUSPENDED",
    ),
    enrollment: course.enrollments[0] ?? null,
    startDate: course.startDate?.toISOString() ?? null,
    endDate: course.endDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Courses
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover courses available at your organization and choose what
          you want to learn next.
        </p>
      </div>

      <ExploreCourses courses={availableCourses} />
    </div>
  );
}
