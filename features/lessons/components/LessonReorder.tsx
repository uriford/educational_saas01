"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { reorderLessonsAction } from "../actions/reorder-lessons.action";

type LessonItem = {
  id: string;
  order: number;
};

type Props = {
  courseId: string;
  lessonId: string;
  index: number;
  total: number;
  lessons: LessonItem[];
};

export default function LessonReorder({
  courseId,
  lessonId,
  index,
  total,
  lessons,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function move(
    direction: "up" | "down",
  ) {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= total ||
      loading
    ) {
      return;
    }

    const current = lessons[index];
    const target = lessons[targetIndex];

    setLoading(true);

    try {
      const result = await reorderLessonsAction(
        courseId,
        [
          {
            lessonId,
            order: target.order,
          },
          {
            lessonId: target.id,
            order: current.order,
          },
        ],
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Lesson order updated.");
      router.refresh();
    } catch (error) {
      console.error(
        "LESSON REORDER ERROR:",
        error,
      );

      toast.error(
        "Failed to update lesson order.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={loading || index === 0}
        title="Move lesson up"
        onClick={() => move("up")}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={
          loading || index === total - 1
        }
        title="Move lesson down"
        onClick={() => move("down")}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
