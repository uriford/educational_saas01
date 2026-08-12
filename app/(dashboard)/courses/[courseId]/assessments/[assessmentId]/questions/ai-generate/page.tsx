import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";

import AIQuestionGenerator from "@/features/ai-question-generation/components/AIQuestionGenerator";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
  }>;
};

export default async function AIQuestionGeneratorPage({
  params,
}: Props) {
  const session = await requireAdmin();

  const { courseId, assessmentId } = await params;

  if (!session.user.organizationId) {
    notFound();
  }

  const organizationId = session.user.organizationId;
  const branchId = session.user.branchId ?? undefined;

  const course = await CourseService.getById(
    courseId,
    organizationId,
    branchId,
  );

  if (!course) {
    notFound();
  }

  const assessment = await AssessmentService.getById(
    assessmentId,
    organizationId,
    branchId,
  );

  if (!assessment || assessment.courseId !== courseId) {
    notFound();
  }

  if (assessment.status !== "DRAFT") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {course.name}
        </p>

        <h1 className="text-2xl font-bold">
          {assessment.title} — AI Question Generator
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Generate source-grounded questions for this draft
          assessment.
        </p>
      </div>

      <AIQuestionGenerator
        courseId={course.id}
        assessmentId={assessment.id}
        assessmentTitle={assessment.title}
      />
    </div>
  );
}
