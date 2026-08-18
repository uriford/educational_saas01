"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { markLessonCompleteAction } from "../actions/mark-lesson-complete.action";

type Props = {
  courseId: string;
  lessonId: string;
  completed: boolean;
};

export default function LessonCompleteButton({
  courseId,
  lessonId,
  completed,
}: Props) {
  const [isCompleted, setIsCompleted] =
    useState(completed);
  const [isLoading, setIsLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");

  async function handleComplete() {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      const result =
        await markLessonCompleteAction(
          courseId,
          lessonId,
        );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setIsCompleted(true);
      setMessage(result.message);
    } catch {
      setMessage(
        "Failed to mark the lesson as complete.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isCompleted) {
    return (
      <div className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-100 px-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        Completed
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleComplete}
        disabled={isLoading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Mark as Complete
          </>
        )}
      </button>

      {message && (
        <p className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
