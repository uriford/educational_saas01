import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";

import AIQuestionGenerator from "@/features/ai-question-generation/components/AIQuestionGenerator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";

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
            Prepare source-grounded questions for this assessment.
          </p>
        </div>

        <div className="flex min-h-[420px] items-center justify-center rounded-xl border bg-card p-8">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              AI Question Generation Is Locked
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This assessment has already been published and is now locked
              for student delivery. AI-generated questions can only be
              prepared while an assessment is in Draft status.
            </p>

            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-sm">
              <span className="text-muted-foreground">
                Current status:
              </span>
              <span className="font-semibold text-foreground">
                {assessment.status}
              </span>
            </div>

            <Link
              href={`/courses/${courseId}/assessments/${assessmentId}`}
              className="mt-7 inline-flex"
            >
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
