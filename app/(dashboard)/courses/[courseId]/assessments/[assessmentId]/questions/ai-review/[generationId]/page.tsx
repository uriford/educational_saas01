import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";

import { AIQuestionGenerationService } from "@/features/ai-question-generation/services/ai-question-generation.service";
import AIQuestionReview from "@/features/ai-question-generation/components/AIQuestionReview";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
    generationId: string;
  }>;
};

export default async function AIQuestionReviewPage({
  params,
}: Props) {
  const session = await requireAdmin();

  const {
    courseId,
    assessmentId,
    generationId,
  } = await params;

  if (!session.user.organizationId) {
    notFound();
  }

  const organizationId =
    session.user.organizationId;

  const branchId =
    session.user.branchId ?? undefined;

  const course =
    await CourseService.getById(
      courseId,
      organizationId,
      branchId,
    );

  if (!course) {
    notFound();
  }

  const assessment =
    await AssessmentService.getById(
      assessmentId,
      organizationId,
      branchId,
    );

  if (
    !assessment ||
    assessment.courseId !== courseId
  ) {
    notFound();
  }

  const generation =
    await AIQuestionGenerationService.getGeneration(
      generationId,
      organizationId,
      branchId ?? "",
    );

  if (!generation) {
    notFound();
  }

  const safeGeneration = {
    id: generation.id,
    title: generation.title,
    description: generation.description,
    status: generation.status,
    questionCount: generation.questionCount,
    difficulty: generation.difficulty,
    createdAt: generation.createdAt,

    sourceDocuments:
      generation.sourceDocuments.map((document) => ({
        id: document.id,
        name: document.name,
        fileName: document.fileName,
        pageCount: document.pageCount,
      })),

    questions:
      generation.generatedQuestionsReview.map(
        (question) => ({
          id: question.id,
          question: question.question,
          type: question.type,
          marks: Number(question.marks),
          options:
            question.options === null
              ? null
              : JSON.parse(
                  JSON.stringify(
                    question.options,
                  ),
                ),
          correctAnswer:
            question.correctAnswer,
          status:
            question.status,
          order:
            question.order,
        }),
      ),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          AI Question Review
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review, edit, approve, or reject
          AI-generated questions before adding
          them to the assessment.
        </p>
      </div>

      <AIQuestionReview
        courseId={courseId}
        assessmentId={assessmentId}
        generation={safeGeneration}
      />
    </div>
  );
}
