import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { AssessmentSubmissionRepository } from "@/features/assessment-submissions/repository/assessment-submission.repository";

import AssessmentAttempt from "@/features/assessment-submissions/components/AssessmentAttempt";

type Props = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function StudentAssessmentPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    redirect("/login");
  }

  const { assessmentId } = await params;

  const assessment =
    await AssessmentSubmissionRepository.findAssessmentForStart(
      assessmentId,
      session.user.organizationId,
      session.user.branchId,
    );

  if (!assessment) {
    redirect("/student/courses");
  }

  if (assessment.status !== "PUBLISHED") {
    redirect("/student/courses");
  }

  const now = new Date();

  if (
    assessment.startDate &&
    now < assessment.startDate
  ) {
    redirect("/student/courses");
  }

  if (
    assessment.endDate &&
    now > assessment.endDate
  ) {
    redirect("/student/courses");
  }

  const questions = assessment.questions.map((question) => ({
    id: question.id,
    question: question.question,
    type: question.type,
    marks: Number(question.marks),
    options: question.options,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href={`/student/courses/${assessment.course.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Course
      </Link>

      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <ClipboardCheck className="size-6 text-primary" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Assessment
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {assessment.title}
                  </h1>
                </div>
              </div>

              {assessment.description && (
                <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {assessment.description}
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-2xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Course
              </p>

              <p className="mt-1 font-semibold">
                {assessment.course.name}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {assessment.course.code}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">
                Questions
              </p>
              <p className="mt-1 text-lg font-semibold">
                {questions.length}
              </p>
            </div>

            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">
                Total marks
              </p>
              <p className="mt-1 text-lg font-semibold">
                {Number(assessment.totalMarks)}
              </p>
            </div>

            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">
                Passing marks
              </p>
              <p className="mt-1 text-lg font-semibold">
                {Number(assessment.passingMarks)}
              </p>
            </div>

            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">
                Duration
              </p>
              <p className="mt-1 text-lg font-semibold">
                {assessment.duration
                  ? `${assessment.duration} min`
                  : "No limit"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <AssessmentAttempt
        assessmentId={assessment.id}
        title={assessment.title}
        duration={assessment.duration}
        questions={questions}
      />
    </div>
  );
}
