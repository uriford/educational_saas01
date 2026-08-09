"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createQuestionAction } from "../actions/create-question.action";

type Props = {
  courseId: string;
  assessmentId: string;
};

export default function CreateQuestionForm({
  courseId,
  assessmentId,
}: Props) {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [type, setType] = useState<
    "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER"
  >("MCQ");
  const [marks, setMarks] = useState("");
  const [options, setOptions] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [order, setOrder] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const parsedOptions =
      type === "MCQ"
        ? options
            .split("\n")
            .map((option) => option.trim())
            .filter(Boolean)
        : undefined;

    const result = await createQuestionAction({
      assessmentId,
      question,
      type,
      marks: Number(marks),
      options: parsedOptions,
      correctAnswer: correctAnswer.trim() || undefined,
      order: Number(order),
    });

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(
      `/courses/${courseId}/assessments/${assessmentId}/questions`,
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="question">
          Question
        </Label>

        <Textarea
          id="question"
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder="Enter the question"
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">
            Question Type
          </Label>

          <select
            id="type"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as
                  | "MCQ"
                  | "TRUE_FALSE"
                  | "SHORT_ANSWER"
                  | "LONG_ANSWER",
              )
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">
              Short Answer
            </option>
            <option value="LONG_ANSWER">
              Long Answer
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks">
            Marks
          </Label>

          <Input
            id="marks"
            type="number"
            min="0.01"
            step="0.01"
            value={marks}
            onChange={(event) =>
              setMarks(event.target.value)
            }
            placeholder="e.g. 5"
            required
          />
        </div>
      </div>

      {type === "MCQ" && (
        <div className="space-y-2">
          <Label htmlFor="options">
            Options
          </Label>

          <Textarea
            id="options"
            value={options}
            onChange={(event) =>
              setOptions(event.target.value)
            }
            placeholder={`Enter one option per line
Option A
Option B
Option C
Option D`}
            required
          />

          <p className="text-xs text-muted-foreground">
            Enter each option on a separate line.
          </p>
        </div>
      )}

      {type === "TRUE_FALSE" && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">
            Correct Answer
          </Label>

          <select
            id="correctAnswer"
            value={correctAnswer}
            onChange={(event) =>
              setCorrectAnswer(event.target.value)
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">
              Select correct answer
            </option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}

      {type === "MCQ" && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">
            Correct Answer
          </Label>

          <Input
            id="correctAnswer"
            value={correctAnswer}
            onChange={(event) =>
              setCorrectAnswer(event.target.value)
            }
            placeholder="Enter the exact correct option"
            required
          />
        </div>
      )}

      {(type === "SHORT_ANSWER" ||
        type === "LONG_ANSWER") && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">
            Correct Answer
          </Label>

          <Textarea
            id="correctAnswer"
            value={correctAnswer}
            onChange={(event) =>
              setCorrectAnswer(event.target.value)
            }
            placeholder="Enter the expected answer"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="order">
          Question Order
        </Label>

        <Input
          id="order"
          type="number"
          min="0"
          value={order}
          onChange={(event) =>
            setOrder(event.target.value)
          }
        />

        <p className="text-xs text-muted-foreground">
          Lower numbers appear first.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              `/courses/${courseId}/assessments/${assessmentId}/questions`,
            )
          }
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </form>
  );
}
