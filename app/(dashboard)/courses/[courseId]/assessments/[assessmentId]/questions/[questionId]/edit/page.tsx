import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";
import { AssessmentQuestionService } from "@/features/assessment-questions/services/assessment-question.service";
import EditQuestionForm from "@/features/assessment-questions/components/EditQuestionForm";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
    questionId: string;
  }>;
};

export default async function EditQuestionPage({ params }: Props) {
  const session = await requireAdmin();

  const { courseId, assessmentId, questionId } = await params;

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

  const question = await AssessmentQuestionService.getById(
    questionId,
    organizationId,
    branchId,
  );

  if (!question || question.assessmentId !== assessmentId) {
    notFound();
  }

  const safeQuestion = {
    id: question.id,
    assessmentId: question.assessmentId,
    question: question.question,
    type: question.type,
    marks: Number(question.marks),
    options: Array.isArray(question.options)
      ? question.options.map(String)
      : [],
    correctAnswer: question.correctAnswer,
    order: question.order,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Question
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update this question in {assessment.title}.
        </p>
      </div>

      <EditQuestionForm
        courseId={courseId}
        assessmentId={assessmentId}
        question={safeQuestion}
      />
    </div>
  );
}
