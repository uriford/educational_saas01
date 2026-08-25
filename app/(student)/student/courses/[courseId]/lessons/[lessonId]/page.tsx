import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  PlayCircle,
} from "lucide-react";

import { getStudentLessonAction } from "@/features/lessons-progress/actions/get-student-lesson.action";
import LessonCompleteButton from "@/features/lessons-progress/components/LessonCompleteButton";

type Props = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

function formatDuration(duration: number | null) {
  if (!duration) return null;

  if (duration < 60) {
    return `${duration} min`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return minutes === 0
    ? `${hours} hr`
    : `${hours} hr ${minutes} min`;
}

function getLessonTypeLabel(type: string) {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "DOCUMENT":
      return "Document";
    case "LINK":
      return "External Resource";
    default:
      return "Reading";
  }
}

export default async function StudentLessonPage({
  params,
}: Props) {
  const { courseId, lessonId } = await params;

  const result = await getStudentLessonAction(
    courseId,
    lessonId,
  );

  if (
    !result.success ||
    !("lesson" in result) ||
    !("enrollment" in result)
  ) {
    redirect(`/student/courses/${courseId}`);
  }

  const lesson = result.lesson;
  const enrollment = result.enrollment;
  const previousLesson = result.previousLesson;
  const nextLesson = result.nextLesson;
  const progress = result.progress;

  if (!lesson || !enrollment) {
    redirect(`/student/courses/${courseId}`);
  }

  const isCompleted = progress?.completed ?? false;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href={`/student/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Course
      </Link>

      {/* Header */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <BookOpen className="size-7 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {enrollment.course.name}
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {lesson.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-4" />
                    {getLessonTypeLabel(lesson.type)}
                  </span>

                  {lesson.duration && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4" />
                      {formatDuration(lesson.duration)}
                    </span>
                  )}

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-muted px-3 py-2 text-sm font-medium">
              Lesson {lesson.order}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {lesson.description && (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm leading-7 text-muted-foreground">
            {lesson.description}
          </p>
        </section>
      )}

      {/* Content */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />

            <h2 className="text-lg font-semibold">
              Lesson Content
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {lesson.type === "TEXT" && (
            <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base">
              {lesson.content ? (
                <div className="whitespace-pre-wrap leading-8">
                  {lesson.content}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No lesson content has been added yet.
                </p>
              )}
            </div>
          )}

          {lesson.type === "VIDEO" && (
            <div className="space-y-5">
              {lesson.videoUrl ? (
                <div className="overflow-hidden rounded-2xl border bg-muted">
                  <div className="aspect-video">
                    <iframe
                      src={lesson.videoUrl}
                      title={lesson.title}
                      className="size-full"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-56 items-center justify-center rounded-2xl bg-muted">
                  <div className="text-center">
                    <PlayCircle className="mx-auto size-10 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No video has been added yet.
                    </p>
                  </div>
                </div>
              )}

              {lesson.content && (
                <div className="whitespace-pre-wrap leading-8 text-muted-foreground">
                  {lesson.content}
                </div>
              )}
            </div>
          )}

          {lesson.type === "DOCUMENT" && (
            <div className="space-y-6">
              {lesson.documentUrl ? (
                <div className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="size-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Lesson Document
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Open the document to study this lesson.
                      </p>
                    </div>
                  </div>

                  <a
                    href={lesson.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Open Document
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No document has been added yet.
                </p>
              )}

              {lesson.content && (
                <div className="whitespace-pre-wrap leading-8 text-muted-foreground">
                  {lesson.content}
                </div>
              )}
            </div>
          )}

          {lesson.type === "LINK" && (
            <div className="space-y-6">
              {lesson.externalUrl ? (
                <div className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Link2 className="size-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        External Learning Resource
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Continue learning using the external resource.
                      </p>
                    </div>
                  </div>

                  <a
                    href={lesson.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Open Resource
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No external resource has been added yet.
                </p>
              )}

              {lesson.content && (
                <div className="whitespace-pre-wrap leading-8 text-muted-foreground">
                  {lesson.content}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">
              Additional Resources
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Supporting materials for this lesson.
            </p>
          </div>

          <div className="divide-y">
            {lesson.resources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">
                      {resource.title}
                    </p>

                    {resource.type && (
                      <p className="text-xs text-muted-foreground">
                        {resource.type}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition hover:bg-muted"
                >
                  Open
                  <ExternalLink className="size-4" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completion */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Finish this lesson
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Mark this lesson as complete when you have finished studying it.
            </p>
          </div>

          <LessonCompleteButton
            courseId={courseId}
            lessonId={lessonId}
            completed={isCompleted}
          />
        </div>
      </section>

      {/* Navigation */}
      <div className="grid gap-4 sm:grid-cols-2">
        {previousLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${previousLesson.id}`}
            className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:bg-muted/20"
          >
            <div className="flex items-center gap-3">
              <ArrowLeft className="size-5 text-muted-foreground transition group-hover:text-primary" />

              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Previous Lesson
                </p>

                <p className="mt-1 truncate font-semibold">
                  {previousLesson.title}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            className="group rounded-2xl border bg-card p-5 text-right shadow-sm transition hover:border-primary/40 hover:bg-muted/20"
          >
            <div className="flex items-center justify-end gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Next Lesson
                </p>

                <p className="mt-1 truncate font-semibold">
                  {nextLesson.title}
                </p>
              </div>

              <ArrowRight className="size-5 text-muted-foreground transition group-hover:text-primary" />
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
