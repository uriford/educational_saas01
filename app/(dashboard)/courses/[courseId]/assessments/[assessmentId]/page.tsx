import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";
import DeleteAssessmentButton from "@/features/assessments/components/DeleteAssessmentButton";
import AssessmentHistory from "@/features/results/components/AssessmentHistory";
import { ResultService } from "@/features/results/services/result.service";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
  }>;
};

const statusStyles = {
  DRAFT:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PUBLISHED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  CLOSED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  ARCHIVED:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
} as const;

export default async function AssessmentDetailsPage({
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

  if (!branchId) {
    notFound();
  }

  const historyResult =
    await ResultService.getAssessmentHistory({
      assessmentId,
      organizationId,
      branchId,
    });

  const history =
    historyResult.success
      ? historyResult.history
      : {
          submissions: [],
          totalSubmissions: 0,
          completedSubmissions: 0,
          inProgressSubmissions: 0,
          averageScore: 0,
          averagePercentage: 0,
          passedCount: 0,
          failedCount: 0,
          pendingManualGradingCount: 0,
        };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/courses/${courseId}/assessments`}
        >
          <Button
            variant="ghost"
            className="-ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {assessment.title}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusStyles[assessment.status]
              }`}
            >
              {assessment.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {course.name} · {course.code}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/courses/${courseId}/assessments/${assessmentId}/edit`}
          >
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Assessment
            </Button>
          </Link>

          <DeleteAssessmentButton
            assessmentId={assessmentId}
          />
        </div>
      </div>

      {assessment.description && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            Description
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {assessment.description}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Target className="h-4 w-4" />}
          label="Total Marks"
          value={Number(
            assessment.totalMarks,
          ).toLocaleString()}
        />

        <InfoCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Passing Marks"
          value={Number(
            assessment.passingMarks,
          ).toLocaleString()}
        />

        <InfoCard
          icon={<Target className="h-4 w-4" />}
          label="Maximum Attempts"
          value={assessment.maxAttempts.toString()}
        />

        <InfoCard
          icon={<Clock3 className="h-4 w-4" />}
          label="Duration"
          value={
            assessment.duration
              ? `${assessment.duration} minutes`
              : "Not specified"
          }
        />

        <InfoCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Questions"
          value={assessment.questions.length.toString()}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Questions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage questions for this
              assessment.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/courses/${courseId}/assessments/${assessmentId}/questions`}
            >
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Manage Questions
              </Button>
            </Link>

            <Link
              href={`/courses/${courseId}/assessments/${assessmentId}/questions/create`}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </Link>
          </div>
        </div>

        {assessment.questions.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No questions yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Add questions to build this assessment.
              </p>

              <Link
                href={`/courses/${courseId}/assessments/${assessmentId}/questions/create`}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add First Question
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {assessment.questions.map(
              (question, index) => (
                <div
                  key={question.id}
                  className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {question.type}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {Number(question.marks)} marks
                      </span>
                    </div>

                    <p className="mt-2 font-medium">
                      {question.question}
                    </p>
                  </div>

                  <Link
                    href={`/courses/${courseId}/assessments/${assessmentId}/questions`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Manage
                    </Button>
                  </Link>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {history && (
        <AssessmentHistory
          history={history}
          courseId={courseId}
          assessmentId={assessmentId}
        />
      )}

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">
          Assessment Schedule
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ScheduleItem
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            label="Start"
            value={
              assessment.startDate
                ? new Intl.DateTimeFormat(
                    "en-US",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  ).format(
                    new Date(
                      assessment.startDate,
                    ),
                  )
                : "Not scheduled"
            }
          />

          <ScheduleItem
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            label="End"
            value={
              assessment.endDate
                ? new Intl.DateTimeFormat(
                    "en-US",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  ).format(
                    new Date(
                      assessment.endDate,
                    ),
                  )
                : "Not scheduled"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function ScheduleItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="mt-0.5 text-muted-foreground">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
