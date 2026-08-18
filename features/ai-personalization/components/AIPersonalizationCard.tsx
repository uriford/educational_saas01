"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { generateAIPersonalizationAction } from "../actions/ai-personalization.actions";
import type { AIPersonalizationResult } from "../types/ai-personalization.types";

type Props = {
  courseId: string;
  personalization: AIPersonalizationResult | null;
};

const levelConfig = {
  BEGINNER: {
    label: "Beginner",
    description:
      "You are building your foundation. Focus on completing the recommended lessons step by step.",
  },
  DEVELOPING: {
    label: "Developing",
    description:
      "You are making progress. Strengthen your weaker areas before moving into more advanced material.",
  },
  PROFICIENT: {
    label: "Proficient",
    description:
      "You have demonstrated solid understanding. Focus on refining your remaining gaps.",
  },
  ADVANCED: {
    label: "Advanced",
    description:
      "You are performing strongly. Continue challenging yourself while strengthening any remaining gaps.",
  },
};

function priorityClasses(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function severityClasses(severity: string) {
  switch (severity) {
    case "HIGH":
      return "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20";

    case "MEDIUM":
      return "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20";

    default:
      return "border-border bg-muted/30";
  }
}

export default function AIPersonalizationCard({
  courseId,
  personalization: initialPersonalization,
}: Props) {
  const [personalization, setPersonalization] =
    useState(initialPersonalization);

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState<string | null>(
    null,
  );

  function refreshPersonalization() {
    setError(null);

    startTransition(async () => {
      const result =
        await generateAIPersonalizationAction(
          courseId,
        );

      if (
        result.success &&
        "personalization" in result &&
        result.personalization
      ) {
        setPersonalization(
          result.personalization,
        );
        return;
      }

      setError(
        "message" in result
          ? result.message ?? "Unable to update your AI analysis."
          : "Unable to update your AI analysis.",
      );
    });
  }

  if (!personalization) {
    return (
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="size-7 text-primary" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-primary" />

                  <p className="text-sm font-semibold text-primary">
                    AI Learning Coach
                  </p>
                </div>

                <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  Discover your personalized learning path
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Our AI will analyze your lesson progress and
                  assessment performance to identify your strengths,
                  knowledge gaps, and the lessons that can help you
                  improve next.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshPersonalization}
              disabled={isPending}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}

              {isPending
                ? "Analyzing..."
                : "Analyze My Progress"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </section>
    );
  }

  const level =
    levelConfig[personalization.learningLevel];

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <BrainCircuit className="size-4 text-primary" />

                <span className="text-sm font-semibold text-primary">
                  AI Learning Coach
                </span>

                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  Personalized
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Your learning journey
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {personalization.summary}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshPersonalization}
            disabled={isPending}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={[
                "size-3.5",
                isPending ? "animate-spin" : "",
              ].join(" ")}
            />

            {isPending
              ? "Updating..."
              : "Update analysis"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Learning level */}
      <div className="grid border-b lg:grid-cols-[260px_1fr]">
        <div className="border-b p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />

            <span className="text-xs font-medium">
              Current learning level
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold">
            {level.label}
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {level.description}
          </p>
        </div>

        <div className="flex items-center p-6">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Next best action
              </p>

              <p className="mt-1 font-semibold">
                {personalization.nextAction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths + gaps */}
      <div className="grid gap-6 border-b p-6 lg:grid-cols-2 sm:p-8">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                Your strengths
              </h3>

              <p className="text-xs text-muted-foreground">
                Areas where your performance is strongest.
              </p>
            </div>
          </div>

          {personalization.strengths.length === 0 ? (
            <p className="mt-5 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              Keep learning and completing assessments. Your
              strengths will become clearer as more data is
              available.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {personalization.strengths.map(
                (strength, index) => (
                  <div
                    key={`${strength.area}-${index}`}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <p className="text-sm font-semibold">
                      {strength.area}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {strength.evidence}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Knowledge gaps */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                Knowledge gaps
              </h3>

              <p className="text-xs text-muted-foreground">
                Areas that need more attention.
              </p>
            </div>
          </div>

          {personalization.knowledgeGaps.length === 0 ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                No major knowledge gaps detected.
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Continue practicing to maintain your progress.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {personalization.knowledgeGaps.map(
                (gap, index) => (
                  <div
                    key={`${gap.area}-${index}`}
                    className={[
                      "rounded-xl border p-4",
                      severityClasses(gap.severity),
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold">
                        {gap.area}
                      </p>

                      <span className="shrink-0 rounded-full bg-background/80 px-2 py-1 text-[10px] font-bold uppercase">
                        {gap.severity}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {gap.evidence}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Lightbulb className="size-4 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold">
              Recommended for you
            </h3>

            <p className="text-xs text-muted-foreground">
              Lessons selected based on your current learning needs.
            </p>
          </div>
        </div>

        {personalization.recommendations.length === 0 ? (
          <div className="mt-5 rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">
            No specific lesson recommendations are available yet.
            Continue learning and complete more assessments so the
            AI can personalize your path.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {personalization.recommendations.map(
              (recommendation, index) => {
                const content = (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">
                          {recommendation.lessonTitle}
                        </h4>

                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                            priorityClasses(
                              recommendation.priority,
                            ),
                          ].join(" ")}
                        >
                          {recommendation.priority}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {recommendation.reason}
                      </p>
                    </div>

                    {recommendation.lessonId && (
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    )}
                  </div>
                );

                if (!recommendation.lessonId) {
                  return (
                    <div
                      key={`${recommendation.lessonTitle}-${index}`}
                      className="rounded-xl border bg-muted/20 p-4 sm:p-5"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${recommendation.lessonId}-${index}`}
                    href={`/student/courses/${courseId}/lessons/${recommendation.lessonId}`}
                    className="group block rounded-xl border bg-muted/20 p-4 transition hover:border-primary/30 hover:bg-muted/40 sm:p-5"
                  >
                    {content}
                  </Link>
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}
