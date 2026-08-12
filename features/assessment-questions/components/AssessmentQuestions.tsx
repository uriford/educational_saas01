import Link from "next/link";
import { Pencil, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import DeleteQuestionButton from "./DeleteQuestionButton";

type Question = {
  id: string;
  question: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";
  marks: unknown;
  options: unknown;
  correctAnswer: string | null;
  order: number;
};

type Props = {
  assessmentId: string;
  courseId: string;
  questions: Question[];
};

const typeLabels: Record<Question["type"], string> = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
};

export default function AssessmentQuestions({
  assessmentId,
  courseId,
  questions,
}: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Questions</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the questions included in this assessment.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/courses/${courseId}/assessments/${assessmentId}/questions/ai-generate`}
          >
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </Link>

          <Link
            href={`/courses/${courseId}/assessments/${assessmentId}/questions/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="mt-4 font-semibold">No questions added</h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Add questions to build this assessment.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/courses/${courseId}/assessments/${assessmentId}/questions/ai-generate`}
            >
              <Button size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </Link>

            <Link
              href={`/courses/${courseId}/assessments/${assessmentId}/questions/create`}
            >
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Question
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y">
          {questions.map((question, index) => (
            <div key={question.id} className="p-6 transition hover:bg-muted/30">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {index + 1}
                    </span>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {typeLabels[question.type]}
                    </span>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {String(question.marks)} marks
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6">{question.question}</p>

                  {question.type === "MCQ" &&
                    Array.isArray(question.options) &&
                    question.options.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={`${question.id}-${optionIndex}`}
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            <span className="mr-2 font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>

                            {String(option)}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/courses/${courseId}/assessments/${assessmentId}/questions/${question.id}/edit`}
                  >
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <DeleteQuestionButton questionId={question.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
