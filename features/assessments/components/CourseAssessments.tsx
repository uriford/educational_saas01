"use client";

import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type Assessment = {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  totalMarks: number;
  passingMarks: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  startDate: string | null;
  endDate: string | null;
};

type Props = {
  courseId: string;
  assessments: Assessment[];
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

export default function CourseAssessments({
  courseId,
  assessments,
}: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Assessments</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage assessments for this course.
          </p>
        </div>

        <Link href={`/courses/${courseId}/assessments/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="flex min-h-56 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">
              No assessments created
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create an assessment to evaluate students enrolled in this
              course.
            </p>

            <Link
              href={`/courses/${courseId}/assessments/create`}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Assessment
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="p-6 transition hover:bg-muted/30"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">
                      {assessment.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[assessment.status]
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </div>

                  {assessment.description && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {assessment.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span>
                      Marks: {assessment.totalMarks}
                    </span>

                    <span>
                      Pass: {assessment.passingMarks}
                    </span>

                    {assessment.duration !== null && (
                      <span>
                        Duration: {assessment.duration} min
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/courses/${courseId}/assessments/${assessment.id}`}
                >
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
