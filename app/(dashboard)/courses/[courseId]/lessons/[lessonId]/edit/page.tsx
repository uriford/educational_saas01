import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { LessonService } from "@/features/lessons/services/lesson.service";
import LessonForm from "@/features/lessons/components/LessonForm";

type Props = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

export default async function EditLessonPage({
  params,
}: Props) {
  const session = await requireAdmin();

  const { courseId, lessonId } = await params;

  if (!session.user.organizationId) {
    notFound();
  }

  const organizationId =
    session.user.organizationId;

  const branchId =
    session.user.branchId ?? undefined;

  const course = await CourseService.getById(
    courseId,
    organizationId,
    branchId,
  );

  if (!course) {
    notFound();
  }

  const lesson = await LessonService.getById(
    lessonId,
    courseId,
    organizationId,
    branchId,
  );

  if (!lesson) {
    notFound();
  }

  return (
    <LessonForm
      mode="edit"
      courseId={courseId}
      lessonId={lesson.id}
      defaultValues={{
        title: lesson.title,
        description:
          lesson.description ?? "",
        content: lesson.content ?? "",
        type: lesson.type,
        videoUrl:
          lesson.videoUrl ?? "",
        documentUrl:
          lesson.documentUrl ?? "",
        externalUrl:
          lesson.externalUrl ?? "",
        duration:
          lesson.duration ?? undefined,
      }}
    />
  );
}
