import {
  CheckCircle2,
  Clock3,
  MinusCircle,
  XCircle,
} from "lucide-react";

type QuestionResult = {
  id: string;
  question: string;
  type:
    | "MCQ"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER";
  marks: number;
  correctAnswer: string | null;
  answer: string | null;
  marksAwarded: number | null;
  isCorrect: boolean | null;
};

type Props = {
  questions: QuestionResult[];
};

function getTypeLabel(
  type: QuestionResult["type"],
) {
  switch (type) {
    case "MCQ":
      return "Multiple Choice";

    case "TRUE_FALSE":
      return "True / False";

    case "SHORT_ANSWER":
      return "Short Answer";

    case "LONG_ANSWER":
      return "Long Answer";

    default:
      return type;
  }
}

export default function AssessmentResultDetails({
  questions,
}: Props) {
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">
          Question Details
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Review your answers and marks for each question.
        </p>
      </div>

      <div className="divide-y">
        {questions.map((question, index) => {
          const pending =
            (question.type === "SHORT_ANSWER" ||
              question.type === "LONG_ANSWER") &&
            question.marksAwarded === null;

          return (
            <article
              key={question.id}
              className="p-6 sm:p-7"
            >
              <div className="flex gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getTypeLabel(question.type)}
                      </p>

                      <h3 className="mt-1 font-semibold leading-7">
                        {question.question}
                      </h3>
                    </div>

                    <div className="shrink-0 rounded-lg bg-muted px-3 py-2 text-sm font-semibold">
                      {question.marksAwarded ?? "—"} /{" "}
                      {question.marks}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Your answer
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {question.answer?.trim()
                        ? question.answer
                        : "No answer provided."}
                    </p>
                  </div>

                  {pending ? (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      <Clock3 className="mt-0.5 size-4 shrink-0" />

                      <span>
                        This answer is waiting for manual
                        grading.
                      </span>
                    </div>
                  ) : question.isCorrect === true ? (
                    <div className="mt-4 flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

                      <span>
                        Correct answer.
                      </span>
                    </div>
                  ) : question.isCorrect === false &&
                    question.type !== "SHORT_ANSWER" &&
                    question.type !== "LONG_ANSWER" ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2 text-sm text-destructive">
                        <XCircle className="mt-0.5 size-4 shrink-0" />

                        <span>
                          Incorrect answer.
                        </span>
                      </div>

                      {question.correctAnswer && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MinusCircle className="mt-0.5 size-4 shrink-0" />

                          <span>
                            Correct answer:{" "}
                            <span className="font-medium text-foreground">
                              {question.correctAnswer}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
