"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const remaining = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining,
  ).padStart(2, "0")}`;
}

function getOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter(
    (item): item is string => typeof item === "string",
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

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);

  const [autoSubmitting, setAutoSubmitting] =
    useState(false);

  const autoSubmitStarted =
    useRef(false);

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (value) => value.trim().length > 0,
      ).length,
    [answers],
  );

  const currentQuestion =
    questions[currentIndex];

  const startAttempt = useCallback(async () => {
    try {
      setMessage(null);

      const result =
        await startAssessmentAction(assessmentId);

      if (
        !result.success ||
        !("submission" in result) ||
        !result.submission
      ) {
        setMessage(
          result.message ??
            "Unable to start assessment.",
        );

        setLoading(false);
        return;
      }

      const submission = result.submission;

      setSubmissionId(submission.id);

      const started = new Date(
        submission.startedAt,
      ).getTime();

      setStartedAt(started);

      const restored: AnswerMap = {};

      submission.answers.forEach((answer) => {
        if (
          typeof answer.answer === "string" &&
          answer.answer.length > 0
        ) {
          restored[answer.questionId] =
            answer.answer;
        }
      });

      setAnswers(restored);

      if (duration !== null) {
        const remaining = Math.max(
          Math.ceil(
            (
              started +
              duration * 60_000 -
              Date.now()
            ) / 1000,
          ),
          0,
        );

        setRemainingSeconds(remaining);
      }

      setLoading(false);
    } catch (error) {
      console.error(
        "START ASSESSMENT CLIENT ERROR:",
        error,
      );

      setMessage(
        "Unable to prepare the assessment. Please try again.",
      );

      setLoading(false);
    }
  }, [assessmentId, duration]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startAttempt();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [startAttempt]);

  const saveAnswer = useCallback(
    async (
      questionId: string,
      value: string,
    ) => {
      if (!submissionId || submitted) {
        return;
      }

      setAnswers((old) => ({
        ...old,
        [questionId]: value,
      }));

      setSaving(questionId);
      setMessage(null);

      try {
        const result =
          await saveAssessmentAnswerAction({
            submissionId,
            questionId,
            answer: value,
          });

        if (!result.success) {
          setMessage(
            result.message ??
              "Failed to save your answer.",
          );
        }
      } catch (error) {
        console.error(
          "SAVE ANSWER CLIENT ERROR:",
          error,
        );

        setMessage(
          "Failed to save your answer. Please try again.",
        );
      } finally {
        setSaving(null);
      }
    },
    [submissionId, submitted],
  );

  const submit = useCallback(
    async (automatic = false) => {
      if (
        !submissionId ||
        submitting ||
        submitted
      ) {
        return;
      }

      if (
        automatic &&
        autoSubmitStarted.current
      ) {
        return;
      }

      if (automatic) {
        autoSubmitStarted.current = true;
        setAutoSubmitting(true);
      } else {
        const confirmed = window.confirm(
          "Submit assessment now?",
        );

        if (!confirmed) {
          return;
        }
      }

      setSubmitting(true);
      setMessage(null);

      try {
        const result =
          await submitAssessmentAction(
            submissionId,
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "Failed to submit assessment.",
          );

          if (automatic) {
            autoSubmitStarted.current = false;
          }

          return;
        }

        setSubmitted(true);
      } catch (error) {
        console.error(
          "SUBMIT ASSESSMENT CLIENT ERROR:",
          error,
        );

        setMessage(
          "Failed to submit assessment. Please try again.",
        );

        if (automatic) {
          autoSubmitStarted.current = false;
        }
      } finally {
        setSubmitting(false);
        setAutoSubmitting(false);
      }
    },
    [
      submissionId,
      submitting,
      submitted,
    ],
  );

  useEffect(() => {
    if (
      startedAt === null ||
      duration === null ||
      submitted
    ) {
      return;
    }

    const updateTimer = () => {
      const remaining = Math.ceil(
        (
          startedAt +
          duration * 60_000 -
          Date.now()
        ) / 1000,
      );

      if (remaining <= 0) {
        setRemainingSeconds(0);
        void submit(true);
        return;
      }

      setRemainingSeconds(remaining);
    };

    updateTimer();

    const timer = setInterval(
      updateTimer,
      1000,
    );

    return () => clearInterval(timer);
  }, [
    startedAt,
    duration,
    submitted,
    submit,
  ]);

  if (loading) {
    return (
      <section className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <Loader2 className="mx-auto size-7 animate-spin text-primary" />

        <p className="mt-4 font-medium">
          Preparing assessment...
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Please wait while we restore your attempt.
        </p>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />

        <h2 className="mt-4 text-xl font-bold">
          Assessment Submitted
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your assessment has been submitted successfully.
          You can now review your result.
        </p>

        <Link
          href={`/student/assessments/${assessmentId}/result?submission=${submissionId}`}
          className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          View Result
        </Link>
      </section>
    );
  }

  if (!currentQuestion) {
    return (
      <section className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <AlertCircle className="mx-auto size-10 text-destructive" />

        <h2 className="mt-4 font-semibold">
          No questions available
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          This assessment does not contain any available
          questions.
        </p>
      </section>
    );
  }

  const currentAnswer =
    answers[currentQuestion.id] ?? "";

  const options =
    getOptions(currentQuestion.options);

  const isTimeLow =
    duration !== null &&
    remainingSeconds !== null &&
    remainingSeconds <= 60;

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Questions
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              {answeredCount}/{questions.length} completed
            </p>
          </div>

          <div className="rounded-lg bg-muted px-2 py-1 text-xs font-medium">
            {Math.round(
              (answeredCount /
                Math.max(questions.length, 1)) *
                100,
            )}
            %
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-3">
          {questions.map((question, index) => {
            const answered =
              Boolean(
                answers[question.id]?.trim(),
              );

            const active =
              index === currentIndex;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() =>
                  setCurrentIndex(index)
                }
                aria-label={`Question ${index + 1}`}
                aria-current={
                  active ? "step" : undefined
                }
                className={[
                  "rounded-lg border p-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : answered
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "hover:bg-muted",
                ].join(" ")}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="min-w-0 space-y-5">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-bold">
                {title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Question {currentIndex + 1} of{" "}
                {questions.length}
              </p>
            </div>

            {duration !== null && (
              <div
                className={[
                  "inline-flex shrink-0 items-center rounded-xl px-4 py-2 font-bold tabular-nums",
                  isTimeLow
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted",
                ].join(" ")}
              >
                <Clock3 className="mr-1.5 size-4" />

                {formatTime(
                  remainingSeconds ?? 0,
                )}
              </div>
            )}
          </div>

          {autoSubmitting && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <Loader2 className="size-4 animate-spin" />
              Time is up. Submitting your assessment...
            </div>
          )}

          {message && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-7">
              {currentQuestion.question}
            </h2>

            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {currentQuestion.marks}{" "}
              {currentQuestion.marks === 1
                ? "mark"
                : "marks"}
            </p>
          </div>

          <div className="mt-6">
            {(
              currentQuestion.type === "MCQ" ||
              currentQuestion.type ===
                "TRUE_FALSE"
            ) && (
              <div className="space-y-3">
                {(
                  currentQuestion.type ===
                    "TRUE_FALSE"
                    ? ["True", "False"]
                    : options
                ).map((option) => {
                  const selected =
                    currentAnswer === option;

                  return (
                    <label
                      key={option}
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={selected}
                        disabled={
                          saving ===
                            currentQuestion.id ||
                          submitting ||
                          autoSubmitting
                        }
                        onChange={() =>
                          void saveAnswer(
                            currentQuestion.id,
                            option,
                          )
                        }
                        className="size-4 accent-primary"
                      />

                      <span className="text-sm font-medium">
                        {option}
                      </span>

                      {selected && (
                        <CheckCircle2 className="ml-auto size-4 text-primary" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {(
              currentQuestion.type ===
                "SHORT_ANSWER" ||
              currentQuestion.type ===
                "LONG_ANSWER"
            ) && (
              <div className="relative">
                <textarea
                  rows={
                    currentQuestion.type ===
                    "LONG_ANSWER"
                      ? 7
                      : 3
                  }
                  value={currentAnswer}
                  disabled={
                    submitting ||
                    autoSubmitting
                  }
                  onChange={(event) =>
                    setAnswers((old) => ({
                      ...old,
                      [currentQuestion.id]:
                        event.target.value,
                    }))
                  }
                  onBlur={(event) =>
                    void saveAnswer(
                      currentQuestion.id,
                      event.target.value,
                    )
                  }
                  className="w-full resize-y rounded-xl border bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Write your answer..."
                />

                <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                  {saving ===
                  currentQuestion.id ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Saved automatically when you leave the field
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={
              currentIndex === 0 ||
              submitting ||
              autoSubmitting
            }
            onClick={() =>
              setCurrentIndex((index) =>
                index - 1,
              )
            }
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </button>

          {currentIndex ===
          questions.length - 1 ? (
            <button
              type="button"
              disabled={
                submitting ||
                autoSubmitting
              }
              onClick={() => void submit(false)}
              className="inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Submit
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={
                submitting ||
                autoSubmitting
              }
              onClick={() =>
                setCurrentIndex((index) =>
                  index + 1,
                )
              }
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
