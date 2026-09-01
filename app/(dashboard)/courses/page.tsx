import { requireAdmin } from "@/features/auth/authorization";
import { CourseRepository } from "@/features/courses/repository/course.repository";
import CoursesPageContent from "./CoursesPageContent";

export default async function CoursesPage() {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return null;
  }

  const { courses, total } = await CourseRepository.findAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    undefined,
    1,
    50,
  );

  return (
    <CoursesPageContent
      courses={courses}
      total={total}
    />
  );
}
