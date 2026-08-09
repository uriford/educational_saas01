import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { TeacherService } from "@/features/teachers/services/teacher.service";

import CreateClassSessionForm from "@/features/class-sessions/components/CreateClassSessionForm";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const session = await requireAdmin();

  const { courseId } = await params;

  if (!session.user.organizationId) {
    notFound();
  }

  const course = await CourseService.getById(
    courseId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!course) {
    notFound();
  }

  const result = await TeacherService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    undefined,
    1,
    100,
  );

return (
  <CreateClassSessionForm
    courseId={course.id}
    courseName={course.name}
    teachers={result.teachers.map((teacher) => ({
      id: teacher.id,
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      status: teacher.status,
    }))}
  />
);
}
