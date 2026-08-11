"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateAssessmentAction } from "../actions/update-assessment.action";

type Props = {
  assessment: {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    duration: number | null;
    totalMarks: number;
    passingMarks: number;
    maxAttempts: number;
    status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
    startDate: string | null;
    endDate: string | null;
  };
};

export default function EditAssessmentForm({
  assessment,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(assessment.title);
  const [description, setDescription] = useState(
    assessment.description ?? "",
  );
  const [duration, setDuration] = useState(
    assessment.duration?.toString() ?? "",
  );
  const [totalMarks, setTotalMarks] = useState(
    assessment.totalMarks.toString(),
  );
  const [passingMarks, setPassingMarks] = useState(
    assessment.passingMarks.toString(),
  );

  const [maxAttempts, setMaxAttempts] = useState(
    assessment.maxAttempts.toString(),
  );
  const [status, setStatus] = useState(assessment.status);
  const [startDate, setStartDate] = useState(
    assessment.startDate
      ? assessment.startDate.slice(0, 16)
      : "",
  );
  const [endDate, setEndDate] = useState(
    assessment.endDate
      ? assessment.endDate.slice(0, 16)
      : "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await updateAssessmentAction({
        id: assessment.id,
        courseId: assessment.courseId,
        title,
        description,
        duration: duration ? Number(duration) : undefined,
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        maxAttempts: Number(maxAttempts),
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(
        `/courses/${assessment.courseId}/assessments/${assessment.id}`,
      );

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Assessment Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Update the basic information for this assessment.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Assessment Title
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Midterm Examination"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe this assessment..."
              rows={5}
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalMarks">
                Total Marks
              </Label>

              <Input
                id="totalMarks"
                type="number"
                min="1"
                step="0.01"
                value={totalMarks}
                onChange={(event) =>
                  setTotalMarks(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingMarks">
                Passing Marks
              </Label>

              <Input
                id="passingMarks"
                type="number"
                min="0"
                step="0.01"
                value={passingMarks}
                onChange={(event) =>
                  setPassingMarks(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (minutes)
              </Label>

              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Availability
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Control the assessment status and availability period.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="status">
              Status
            </Label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as typeof status,
                )
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">
              Start Date
            </Label>

            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">
              End Date
            </Label>

            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}