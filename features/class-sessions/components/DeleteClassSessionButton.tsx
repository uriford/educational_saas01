"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteClassSessionAction } from "../actions/delete-class-session.action";

type Props = {
  sessionId: string;
};

export default function DeleteClassSessionButton({
  sessionId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class session?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const result = await deleteClassSessionAction({
        id: sessionId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete class session.");
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