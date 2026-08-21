import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
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

  const courses =
    await CourseService.getPublicCourses(
      session.user.organizationId,
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

    enrolledCount:
      course._count.enrollments,

    status: course.status,

    branch: course.branch
      ? {
          id: course.branch.id,
          name: course.branch.name,
          address: course.branch.address,
          slug: course.branch.slug,
          isHeadquarters: course.branch.isHeadquarters,
        }
      : null,

    startDate:
      course.startDate?.toISOString() ?? null,

    endDate:
      course.endDate?.toISOString() ?? null,
  }));


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Courses
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover courses available across your organization.
        </p>
      </div>


      <ExploreCourses
        courses={availableCourses}
      />
    </div>
  );
}
