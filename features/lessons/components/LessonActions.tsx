"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteLessonAction } from "../actions/delete-lesson.action";
import { updateLessonStatusAction } from "../actions/update-lesson-status.action";

type Props = {
  lessonId: string;
  courseId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export default function LessonActions({
  lessonId,
  courseId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(
    nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  ) {
    setLoading(true);

    try {
      const result = await updateLessonStatusAction(
        lessonId,
        courseId,
        nextStatus,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const result = await deleteLessonAction(
        lessonId,
        courseId,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() =>
          router.push(
            `/courses/${courseId}/lessons/${lessonId}/edit`,
          )
        }
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      {status === "DRAFT" && (
        <Button
          size="sm"
          disabled={loading}
          onClick={() =>
            handleStatusChange("PUBLISHED")
          }
        >
          Publish
        </Button>
      )}

      {status === "PUBLISHED" && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() =>
            handleStatusChange("DRAFT")
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Draft
        </Button>
      )}

      {status !== "ARCHIVED" && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() =>
            handleStatusChange("ARCHIVED")
          }
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
      )}

      {status === "ARCHIVED" && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() =>
            handleStatusChange("DRAFT")
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restore
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        disabled={loading}
        title="Delete lesson"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <MoreHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
    </div>
  );
}
