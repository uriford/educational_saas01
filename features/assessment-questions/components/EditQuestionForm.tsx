"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateQuestionAction } from "../actions/update-question.action";

type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";

type Props = {
  question: {
    id: string;
    question: string;
    type: QuestionType;
    marks: number;
    options: string[];
    correctAnswer: string | null;
    order: number;
  };
  courseId: string;
  assessmentId: string;
};

export default function EditQuestionForm({
  question,
  courseId,
  assessmentId,
}: Props) {
  const router = useRouter();

  const [questionText, setQuestionText] = useState(question.question);
  const [type, setType] = useState<QuestionType>(question.type);
  const [marks, setMarks] = useState(String(question.marks));
  const [options, setOptions] = useState<string[]>(
    question.options.length > 0 ? question.options : ["", "", "", ""],
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    question.correctAnswer ?? "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isChoiceQuestion = type === "MCQ" || type === "TRUE_FALSE";

  function handleTypeChange(value: QuestionType) {
    setType(value);

    if (value === "TRUE_FALSE") {
      setOptions(["TRUE", "FALSE"]);

      if (correctAnswer !== "TRUE" && correctAnswer !== "FALSE") {
        setCorrectAnswer("");
      }
    } else if (value === "MCQ") {
      setOptions((current) =>
        current.length >= 2 ? current : ["", "", "", ""],
      );
    } else {
      setOptions([]);
      setCorrectAnswer("");
    }
  }

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, i) => (i === index ? value : option)),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await updateQuestionAction({
      id: question.id,
      question: questionText,
      type,
      marks: Number(marks),
      options: isChoiceQuestion ? options : undefined,
      correctAnswer: correctAnswer || null,
      order: question.order,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    router.push(`/courses/${courseId}/assessments/${assessmentId}/questions`);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">Edit Question</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the question, marks, options, or correct answer.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>

        <Textarea
          id="question"
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Enter the question..."
          rows={5}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Question Type</Label>

          <select
            id="type"
            value={type}
            onChange={(event) =>
              handleTypeChange(event.target.value as QuestionType)
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="LONG_ANSWER">Long Answer</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks">Marks</Label>

          <Input
            id="marks"
            type="number"
            min="0.01"
            step="0.01"
            value={marks}
            onChange={(event) => setMarks(event.target.value)}
            required
          />
        </div>
      </div>

      {type === "MCQ" && (
        <div className="space-y-4">
          <div>
            <Label>Options</Label>

            <p className="mt-1 text-xs text-muted-foreground">
              Enter the choices students can select.
            </p>
          </div>

          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>

              <Input
                id={`option-${index}`}
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {type === "TRUE_FALSE" && (
        <div className="space-y-2">
          <Label htmlFor="trueFalseAnswer">Correct Answer</Label>

          <select
            id="trueFalseAnswer"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select correct answer</option>
            <option value="TRUE">True</option>
            <option value="FALSE">False</option>
          </select>
        </div>
      )}

      {type === "MCQ" && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">Correct Answer</Label>

          <select
            id="correctAnswer"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select correct answer</option>

            {options
              .filter((option) => option.trim())
              .map((option, index) => (
                <option key={`${option}-${index}`} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
      )}

      {(type === "SHORT_ANSWER" || type === "LONG_ANSWER") && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">Expected Answer</Label>

          <Textarea
            id="correctAnswer"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value)}
            placeholder="Enter the expected answer..."
            rows={4}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 border-t pt-6">
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
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
