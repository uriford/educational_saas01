"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createAssessmentAction } from "../actions/create-assessment.action";

type Props = {
  courseId: string;
  organizationId: string;
  branchId: string;
};

export default function CreateAssessmentForm({
  courseId,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [status] = useState<
    "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED"
  >("DRAFT");
  const [startDate] = useState("");
  const [endDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await createAssessmentAction({
      courseId,
      title,
      description,
      duration: duration
        ? Number(duration)
        : undefined,
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      maxAttempts: Number(maxAttempts),
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/courses/${courseId}/assessments`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button
          type="button"
          variant="ghost"
          className="mb-3 -ml-2"
          onClick={() =>
            router.push(`/courses/${courseId}/assessments`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>

        <h1 className="text-2xl font-bold">
          Create Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create an assessment for this course.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

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
            className="flex min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="totalMarks">
              Total Marks
            </Label>

            <Input
              id="totalMarks"
              type="number"
              min="1"
              value={totalMarks}
              onChange={(event) =>
                setTotalMarks(event.target.value)
              }
              placeholder="100"
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
              value={passingMarks}
              onChange={(event) =>
                setPassingMarks(event.target.value)
              }
              placeholder="40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttempts">
              Maximum Attempts
            </Label>

            <Input
              id="maxAttempts"
              type="number"
              min="1"
              value={maxAttempts}
              onChange={(event) =>
                setMaxAttempts(event.target.value)
              }
              placeholder="1"
              required
            />

            <p className="text-xs text-muted-foreground">
              How many times a student can attempt this assessment.
            </p>
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
              placeholder="60"
            />

            <p className="text-xs text-muted-foreground">
              Leave empty for no time limit.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `/courses/${courseId}/assessments`,
              )
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />

            {loading
              ? "Creating..."
              : "Create Assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
