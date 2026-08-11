import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  User,
  XCircle,
} from "lucide-react";

import ManualGradeForm from "./ManualGradeForm";

type Question = {
  id: string;
  question: string;
  type:
    | "MCQ"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER";
  marks: number;
  options: unknown;
  correctAnswer: string | null;
  answer: string | null;
  marksAwarded: number | null;
  isCorrect: boolean | null;
};

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED";
  startedAt: Date;
  submittedAt: Date | null;
  student: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
  };
  assessment: {
    id: string;
    title: string;
    description: string | null;
    course: {
      id: string;
      name: string;
      code: string;
    };
    totalMarks: number;
    passingMarks: number;
  };
  score: number;
  percentage: number;
  pendingManualGrading: boolean;
  passed: boolean;
  answeredCount: number;
  questionCount: number;
  questions: Question[];
};

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];

  return options.filter(
    (option): option is string =>
      typeof option === "string",
  );
}

export default function TeacherSubmissionReview({
  submission,
  courseId,
  assessmentId,
}: {
  submission: Submission;
  courseId: string;
  assessmentId: string;
}) {
  return (
    <div className="space-y-8">
      <Link
        href={`/courses/${courseId}/assessments/${assessmentId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment History
      </Link>

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Student Submission
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                {submission.student.firstName}{" "}
                {submission.student.lastName ?? ""}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {submission.student.studentId}
                {submission.student.email
                  ? ` · ${submission.student.email}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Assessment
          </p>
          <p className="mt-1 font-semibold">
            {submission.assessment.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {submission.assessment.course.name} ·{" "}
            {submission.assessment.course.code}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Score"
          value={`${submission.score}/${submission.assessment.totalMarks}`}
        />

        <SummaryCard
          label="Percentage"
          value={`${submission.percentage}%`}
        />

        <SummaryCard
          label="Answered"
          value={`${submission.answeredCount}/${submission.questionCount}`}
        />

        <SummaryCard
          label="Submitted"
          value={formatDate(submission.submittedAt)}
        />

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <div className="mt-2">
            {submission.pendingManualGrading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <Clock3 className="h-3.5 w-3.5" />
                Awaiting grading
              </span>
            ) : submission.passed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-3.5 w-3.5" />
                Failed
              </span>
            )}
          </div>
        </div>
      </div>

      {submission.pendingManualGrading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Manual grading required
              </p>

              <p className="mt-1 leading-6">
                Review the written answers below and
                award marks. The final score will be
                recalculated automatically after each
                grade is saved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {submission.questions.map(
          (question, index) => {
            const options = getOptions(
              question.options,
            );

            const isWritten =
              question.type === "SHORT_ANSWER" ||
              question.type === "LONG_ANSWER";

            return (
              <section
                key={question.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="border-b bg-muted/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        Question {index + 1}
                      </span>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {question.type}
                      </span>
                    </div>

                    <span className="text-sm font-semibold">
                      {question.marksAwarded !== null
                        ? `${question.marksAwarded}/${question.marks}`
                        : `—/${question.marks}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <p className="font-medium leading-7">
                      {question.question}
                    </p>
                  </div>

                  {options.length > 0 && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Options
                      </p>

                      <div className="mt-3 space-y-2">
                        {options.map(
                          (option, optionIndex) => (
                            <div
                              key={`${question.id}-${optionIndex}`}
                              className="rounded-md border bg-background px-3 py-2 text-sm"
                            >
                              {option}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Student Answer
                    </p>

                    <div className="mt-2 rounded-lg border bg-background p-4">
                      {question.answer ? (
                        <p className="whitespace-pre-wrap text-sm leading-7">
                          {question.answer}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          No answer provided.
                        </p>
                      )}
                    </div>
                  </div>

                  {!isWritten && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Correct Answer
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {question.correctAnswer ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Evaluation
                        </p>

                        <div className="mt-2">
                          {question.isCorrect === true ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Correct
                            </span>
                          ) : question.isCorrect === false ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                              <XCircle className="h-4 w-4" />
                              Incorrect
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not evaluated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isWritten && (
                    <ManualGradeForm
                      submissionId={submission.id}
                      questionId={question.id}
                      maxMarks={question.marks}
                      currentMarks={
                        question.marksAwarded
                      }
                    />
                  )}
                </div>
              </section>
            );
          },
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}
