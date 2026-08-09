import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";

import AssessmentQuestions from "@/features/assessment-questions/components/AssessmentQuestions";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
  }>;
};

export default async function AssessmentQuestionsPage({
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

  const safeQuestions = assessment.questions.map(
    (question) => ({
      id: question.id,
      question: question.question,
      type: question.type,
      marks: Number(question.marks),
      options:
        question.options === null
          ? null
          : JSON.parse(JSON.stringify(question.options)),
      correctAnswer: question.correctAnswer,
      order: question.order,
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {assessment.title} — Questions
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage questions for this assessment.
        </p>
      </div>

      <AssessmentQuestions
        assessmentId={assessment.id}
        courseId={course.id}
        questions={safeQuestions}
      />
    </div>
  );
}
