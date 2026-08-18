import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  FileText,
  ExternalLink,
  Plus,
  Video,
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

import { CourseService } from "@/features/courses/services/course.service";
import { LessonService } from "@/features/lessons/services/lesson.service";
import LessonActions from "@/features/lessons/components/LessonActions";
import LessonReorder from "@/features/lessons/components/LessonReorder";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

const statusStyles = {
  DRAFT:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PUBLISHED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  ARCHIVED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
} as const;

const typeStyles = {
  TEXT: {
    label: "Text",
    icon: FileText,
  },
  VIDEO: {
    label: "Video",
    icon: Video,
  },
  DOCUMENT: {
    label: "Document",
    icon: BookOpen,
  },
  LINK: {
    label: "External Link",
    icon: ExternalLink,
  },
} as const;

export default async function LessonsPage({
  params,
}: Props) {
  const { courseId } = await params;

  const session = await auth();

  if (!session?.user?.organizationId) {
    notFound();
  }

  const organizationId =
    session.user.organizationId;

  const branchId =
    session.user.branchId ?? undefined;

  const course = await CourseService.getById(
    courseId,
    organizationId,
    branchId,
  );

  if (!course) {
    notFound();
  }

  const lessons = await LessonService.getAll(
    courseId,
    organizationId,
    branchId,
  );

  const publishedCount = lessons.filter(
    (lesson) => lesson.status === "PUBLISHED",
  ).length;

  const draftCount = lessons.filter(
    (lesson) => lesson.status === "DRAFT",
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <Link
            href={`/courses/${courseId}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Lessons
            </h1>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {lessons.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage learning content for{" "}
            <span className="font-medium text-foreground">
              {course.name}
            </span>
            .
          </p>
        </div>

        <Link
          href={`/courses/${courseId}/lessons/create`}
        >
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Lessons"
          value={lessons.length}
        />

        <SummaryCard
          label="Published"
          value={publishedCount}
        />

        <SummaryCard
          label="Drafts"
          value={draftCount}
        />
      </div>

      {/* Lessons */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">
            Course Lessons
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Organize and manage the learning materials
            students will access.
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No lessons yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start building this course by adding its
                first lesson, lecture, video, document, or
                learning resource.
              </p>

              <Link
                href={`/courses/${courseId}/lessons/create`}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create First Lesson
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {lessons.map((lesson) => {
              const type =
                typeStyles[lesson.type];

              const TypeIcon = type.icon;

              return (
                <div
                  key={lesson.id}
                  className="group p-6 transition hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {/* Order */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                        {String(
                          lesson.order + 1,
                        ).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {lesson.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusStyles[
                                lesson.status
                              ]
                            }`}
                          >
                            {lesson.status}
                          </span>
                        </div>

                        {lesson.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {lesson.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5" />
                            {type.label}
                          </span>

                          {lesson.duration !==
                            null && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" />
                              {lesson.duration} min
                            </span>
                          )}

                          <span>
                            {lesson._count.resources}{" "}
                            {lesson._count.resources ===
                            1
                              ? "resource"
                              : "resources"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <LessonReorder
                        courseId={courseId}
                        lessonId={lesson.id}
                        index={lessons.findIndex(
                          (item) => item.id === lesson.id,
                        )}
                        total={lessons.length}
                        lessons={lessons.map((item) => ({
                          id: item.id,
                          order: item.order,
                        }))}
                      />

                      <LessonActions
                        lessonId={lesson.id}
                        courseId={courseId}
                        status={lesson.status}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}
