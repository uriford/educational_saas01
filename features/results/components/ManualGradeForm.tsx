"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { gradeAssessmentAnswerAction } from "../actions/grade-assessment-answer.action";

type Props = {
  submissionId: string;
  questionId: string;
  maxMarks: number;
  currentMarks: number | null;
  disabled?: boolean;
};

export default function ManualGradeForm({
  submissionId,
  questionId,
  maxMarks,
  currentMarks,
  disabled = false,
}: Props) {
  const [marks, setMarks] = useState(
    currentMarks !== null
      ? String(currentMarks)
      : "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function save() {
    setError(null);
    setSaved(false);

    const value = Number(marks);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > maxMarks
    ) {
      setError(
        `Enter a mark between 0 and ${maxMarks}.`,
      );
      return;
    }

    setSaving(true);

    const result =
      await gradeAssessmentAnswerAction({
        submissionId,
        questionId,
        marksAwarded: value,
      });

    setSaving(false);

    if (!result.success) {
      setError(
        result.message || "Failed to save grade.",
      );
      return;
    }

    setSaved(true);

    window.setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  return (
    <div className="mt-4 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Marks awarded
          </label>

          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxMarks}
              step="0.01"
              value={marks}
              disabled={disabled || saving}
              onChange={(event) =>
                setMarks(event.target.value)
              }
              className="h-10 w-28 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />

            <span className="text-sm text-muted-foreground">
              / {maxMarks}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void save()}
          disabled={disabled || saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? "Saving..."
            : saved
              ? "Saved"
              : "Save Grade"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
