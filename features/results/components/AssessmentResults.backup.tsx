"use client";

import {
  Award,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  XCircle,
} from "lucide-react";

type Props = {
  result: {
    title: string;
    course: {
      id: string;
      name: string;
      code: string;
    };
    status: string;
    totalMarks: number;
    passingMarks: number;
    score: number;
    percentage: number;
    passed: boolean;
    pendingManualGrading: boolean;
    questionCount: number;
    answeredCount: number;
    attemptNumber: number;
    submittedAt: Date | string | null;
  };
};

function formatDate(value: Date | string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AssessmentResults({
  result,
}: Props) {
  const statusLabel =
    result.pendingManualGrading
      ? "Pending grading"
      : result.passed
        ? "Passed"
        : "Failed";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <GraduationCap className="size-6 text-primary" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Assessment Result
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {result.title}
                  </h1>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-medium">
                  {result.course.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {result.course.code}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${
                result.pendingManualGrading
                  ? "border-amber-300/50 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  : result.passed
                    ? "border-emerald-300/50 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-destructive/30 bg-destructive/5"
              }`}
            >
              {result.pendingManualGrading ? (
                <Clock3 className="size-6 text-amber-600 dark:text-amber-400" />
              ) : result.passed ? (
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="size-6 text-destructive" />
              )}

              <div>
                <p className="text-xs text-muted-foreground">
                  Result
                </p>

                <p className="font-bold">
                  {statusLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result.pendingManualGrading && (
        <section className="rounded-2xl border border-amber-300/50 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex gap-3">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Manual grading is pending
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-300">
                Some written answers still need to be
                graded. Your final score and pass/fail
                status will be available after grading.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="size-4" />
            Score
          </div>

          <p className="mt-3 text-3xl font-bold">
            {result.score}
            <span className="ml-1 text-base font-medium text-muted-foreground">
              / {result.totalMarks}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCheck2 className="size-4" />
            Percentage
          </div>

          <p className="mt-3 text-3xl font-bold">
            {result.percentage.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Passing marks
          </p>

          <p className="mt-3 text-3xl font-bold">
            {result.passingMarks}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Attempt
          </p>

          <p className="mt-3 text-3xl font-bold">
            #{result.attemptNumber}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Questions answered
            </p>

            <p className="mt-1 font-semibold">
              {result.answeredCount} /{" "}
              {result.questionCount}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Submission status
            </p>

            <p className="mt-1 font-semibold">
              {result.status}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Submitted
            </p>

            <p className="mt-1 font-semibold">
              {formatDate(result.submittedAt)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
