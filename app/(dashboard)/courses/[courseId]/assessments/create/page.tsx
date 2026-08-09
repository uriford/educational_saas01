import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import CreateAssessmentForm from "@/features/assessments/components/CreateAssessmentForm";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CreateAssessmentPage({
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
    <CreateAssessmentForm
      courseId={course.id}
      organizationId={course.organizationId}
      branchId={course.branchId}
    />
  );
}