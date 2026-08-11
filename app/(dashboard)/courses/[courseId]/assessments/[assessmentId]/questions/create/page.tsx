import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";
import CreateQuestionForm from "@/features/assessment-questions/components/CreateQuestionForm";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
  }>;
};

export default async function CreateQuestionPage({
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

  if (
    !assessment ||
    assessment.courseId !== courseId
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/courses/${courseId}/assessments/${assessmentId}/questions`}
        >
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Question
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a question to &quot;{assessment.title}&quot;.
          </p>
        </div>
      </div>

      <CreateQuestionForm
        courseId={courseId}
        assessmentId={assessmentId}
      />
    </div>
  );
}
