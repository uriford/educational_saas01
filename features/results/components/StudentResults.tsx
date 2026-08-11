"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Target,
  XCircle,
} from "lucide-react";

type StudentResult = {
  submissionId: string;
  assessmentId: string;
  title: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  totalMarks: number;
  passingMarks: number;
  score: number;
  percentage: number;
  passed: boolean;
  pendingManualGrading: boolean;
  status: string;
  attemptNumber: number;
  submittedAt: Date | null;
  createdAt: Date;
};

type Props = {
  results: StudentResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    averagePercentage: number;
  };
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentResults({
  results,
  summary,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          My Results
        </h1>

        <p className="mt-2 text-muted-foreground">
          View your completed assessment results and
          performance history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={
            <FileText className="size-5 text-muted-foreground" />
          }
          label="Assessments"
          value={summary.total.toString()}
        />

        <SummaryCard
          icon={
            <CheckCircle2 className="size-5 text-emerald-600" />
          }
          label="Passed"
          value={summary.passed.toString()}
        />

        <SummaryCard
          icon={
            <XCircle className="size-5 text-red-600" />
          }
          label="Failed"
          value={summary.failed.toString()}
        />

        <SummaryCard
          icon={
            <Target className="size-5 text-primary" />
          }
          label="Average"
          value={`${summary.averagePercentage}%`}
        />
      </div>

      {summary.pending > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600" />

          <div>
            <p className="font-semibold">
              {summary.pending} result
              {summary.pending === 1 ? "" : "s"} pending
              manual grading
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your final result will be available after
              the remaining answers are graded.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">
            Assessment History
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Every completed assessment attempt is shown
            here.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                <FileText className="size-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No results yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your completed assessment results will
                appear here.
              </p>

              <Link
                href="/student/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View My Courses
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {results.map((result) => (
              <div
                key={result.submissionId}
                className="flex flex-col gap-5 p-6 transition-colors hover:bg-muted/30 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {result.title}
                    </h3>

                    {result.pendingManualGrading ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                        Pending
                      </span>
                    ) : result.passed ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        Passed
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                        Failed
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.course.name} ·{" "}
                    {result.course.code}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span>
                      Attempt {result.attemptNumber}
                    </span>

                    <span>
                      Submitted{" "}
                      {formatDate(result.submittedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-28 text-left sm:text-right">
                    <p className="text-xl font-bold">
                      {result.score} /{" "}
                      {result.totalMarks}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {result.percentage}%
                    </p>
                  </div>

                  <Link
                    href={`/student/assessments/${result.assessmentId}/result?submission=${result.submissionId}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    View Result
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
