"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { startAssessmentAction } from "../actions/start-assessment.action";
import { saveAssessmentAnswerAction } from "../actions/save-assessment-answer.action";
import { submitAssessmentAction } from "../actions/submit-assessment.action";

type Question = {
  id: string;
  question: string;
  type:
    | "MCQ"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER";
  marks: number;
  options: unknown;
};

type Props = {
  assessmentId: string;
  title: string;
  duration: number | null;
  questions: Question[];
};

type AnswerMap = Record<string, string>;

function formatTime(seconds: number) {
  const safe = Math.max(seconds, 0);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function getOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter(
    (option): option is string =>
      typeof option === "string",
  );
}

export default function AssessmentAttempt({
  assessmentId,
  title,
  duration,
  questions,
}: Props) {
  const [submissionId, setSubmissionId] =
    useState<string | null>(null);

  const [startedAt, setStartedAt] =
    useState<number | null>(null);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [loading, setLoading] = useState(true);
  const [savingQuestionId, setSavingQuestionId] =
    useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] =
    useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);

  const totalAnswered = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) => answer.trim().length > 0,
      ).length,
    [answers],
  );

  const startAttempt = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    const result =
      await startAssessmentAction(assessmentId);

    if (!result.success || !("submission" in result) || !result.submission) {
      setMessage(
        result.message ||
          "Unable to start this assessment.",
      );
      setLoading(false);
      return;
    }

    const submission = result.submission;

    setSubmissionId(submission.id);

    const started =
      new Date(submission.startedAt).getTime();

    setStartedAt(started);

    const restoredAnswers: AnswerMap = {};

    for (const answer of submission.answers) {
      if (answer.answer !== null) {
        restoredAnswers[answer.questionId] =
          answer.answer;
      }
    }

    setAnswers(restoredAnswers);

    if (duration) {
      const endTime =
        started + duration * 60 * 1000;

      setRemainingSeconds(
        Math.max(
          Math.ceil((endTime - Date.now()) / 1000),
          0,
        ),
      );
    } else {
      setRemainingSeconds(null);
    }

    setLoading(false);
  }, [assessmentId, duration]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startAttempt();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [startAttempt]);

  const submit = useCallback(
    async (automatic = false) => {
      if (!submissionId || submitting || submitted) {
        return;
      }

      setSubmitting(true);
      setMessage(
        automatic
          ? "Time is up. Submitting your assessment..."
          : null,
      );

      const result =
        await submitAssessmentAction(submissionId);

      if (!result.success) {
        setMessage(
          result.message ||
            "Failed to submit assessment.",
        );
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
      setRemainingSeconds(0);
      setMessage(
        result.message ||
          "Assessment submitted successfully.",
      );
    },
    [submissionId, submitting, submitted],
  );

  useEffect(() => {
    if (
      !startedAt ||
      !duration ||
      submitted
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const endTime =
        startedAt + duration * 60 * 1000;

      const remaining = Math.ceil(
        (endTime - Date.now()) / 1000,
      );

      if (remaining <= 0) {
        setRemainingSeconds(0);
        window.clearInterval(interval);
        void submit(true);
        return;
      }

      setRemainingSeconds(remaining);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    startedAt,
    duration,
    submitted,
    submit,
  ]);

  async function saveAnswer(
    questionId: string,
    answer: string,
  ) {
    if (!submissionId || submitted) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));

    setSavingQuestionId(questionId);

    const result =
      await saveAssessmentAnswerAction({
        submissionId,
        questionId,
        answer,
      });

    if (!result.success) {
      setMessage(
        result.message ||
          "Failed to save your answer.",
      );

      if ("expired" in result && result.expired) {
        void submit(true);
      }
    }

    setSavingQuestionId(null);
  }

  if (loading) {
    return (
      <section className="flex min-h-80 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto size-7 animate-spin text-primary" />

          <p className="mt-4 font-medium">
            Preparing your assessment...
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your attempt is being loaded.
          </p>
        </div>
      </section>
    );
  }

  if (!submissionId) {
    return (
      <section className="rounded-2xl border border-destructive/30 bg-card p-8 shadow-sm">
        <div className="text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />

          <h2 className="mt-4 font-semibold">
            Unable to start assessment
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {message ||
              "Something went wrong while starting your attempt."}
          </p>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border bg-card p-10 shadow-sm">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Assessment Submitted
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your answers for{" "}
            <span className="font-medium text-foreground">
              {title}
            </span>{" "}
            have been submitted successfully.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {message}
          </p>

          <Link
            href={`/student/assessments/${assessmentId}/result?submission=${submissionId}`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            View Result
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="sticky top-4 z-20 rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {title}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {totalAnswered} of {questions.length}{" "}
              answered
            </p>
          </div>

          <div className="flex items-center gap-3">
            {duration && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                  remainingSeconds !== null &&
                  remainingSeconds <= 60
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted"
                }`}
              >
                <Clock3 className="size-4" />
                {formatTime(
                  remainingSeconds ?? 0,
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => void submit(false)}
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Submit
            </button>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {message}
        </div>
      )}

      <div className="space-y-5">
        {questions.length === 0 ? (
          <section className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto size-8 text-muted-foreground" />

            <h2 className="mt-4 font-semibold">
              No questions available
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This assessment does not contain any
              questions yet.
            </p>
          </section>
        ) : (
          questions.map((question, index) => {
            const options =
              getOptions(question.options);

            const currentAnswer =
              answers[question.id] ?? "";

            return (
              <section
                key={question.id}
                className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold leading-7">
                        {question.question}
                      </h2>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {question.marks}{" "}
                        {question.marks === 1
                          ? "mark"
                          : "marks"}
                      </p>
                    </div>
                  </div>

                  {savingQuestionId ===
                    question.id && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                </div>

                <div className="mt-6">
                  {question.type === "MCQ" &&
                  options.length > 0 ? (
                    <div className="space-y-3">
                      {options.map((option) => (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                            currentAnswer === option
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={
                              currentAnswer ===
                              option
                            }
                            onChange={(event) =>
                              void saveAnswer(
                                question.id,
                                event.target.value,
                              )
                            }
                            className="size-4 accent-primary"
                          />

                          <span className="text-sm">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : question.type ===
                    "TRUE_FALSE" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["True", "False"].map(
                        (option) => (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                              currentAnswer ===
                              option
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={
                                currentAnswer ===
                                option
                              }
                              onChange={(event) =>
                                void saveAnswer(
                                  question.id,
                                  event.target
                                    .value,
                                )
                              }
                              className="size-4 accent-primary"
                            />

                            <span className="text-sm font-medium">
                              {option}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  ) : question.type ===
                    "LONG_ANSWER" ? (
                    <textarea
                      value={currentAnswer}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]:
                            event.target.value,
                        }))
                      }
                      onBlur={(event) =>
                        void saveAnswer(
                          question.id,
                          event.target.value,
                        )
                      }
                      rows={7}
                      placeholder="Write your answer..."
                      className="w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]:
                            event.target.value,
                        }))
                      }
                      onBlur={(event) =>
                        void saveAnswer(
                          question.id,
                          event.target.value,
                        )
                      }
                      placeholder="Enter your answer..."
                      className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>
              </section>
            );
          })
        )}
      </div>

      {questions.length > 0 && (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Ready to finish?
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Make sure your answers are saved before
                submitting.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void submit(false)}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Submit Assessment
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
