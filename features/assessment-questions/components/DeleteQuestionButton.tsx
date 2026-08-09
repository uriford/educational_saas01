"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteQuestionAction } from "../actions/delete-question.action";

type Props = {
  questionId: string;
};

export default function DeleteQuestionButton({
  questionId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const result = await deleteQuestionAction({
        id: questionId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      window.location.reload();
    } catch (error) {
      console.error("DELETE QUESTION ERROR:", error);

      toast.error("Failed to delete question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}