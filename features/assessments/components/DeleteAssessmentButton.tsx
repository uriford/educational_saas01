"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteAssessmentAction } from "../actions/delete-assessment.action";

type Props = {
  assessmentId: string;
};

export default function DeleteAssessmentButton({
  assessmentId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment?",
    );

    if (!confirmed) return;

    setLoading(true);

    const result = await deleteAssessmentAction({
      id: assessmentId,
    });

    if (!result.success) {
      window.alert(result.message);
      setLoading(false);
      return;
    }

    router.push("/courses");
    router.refresh();
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Deleting..." : "Delete Assessment"}
    </Button>
  );
}
