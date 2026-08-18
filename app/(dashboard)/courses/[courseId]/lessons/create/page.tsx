import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import LessonForm from "@/features/lessons/components/LessonForm";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CreateLessonPage({
  params,
}: Props) {
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

  return (
    <LessonForm
      mode="create"
      courseId={course.id}
    />
  );
}
