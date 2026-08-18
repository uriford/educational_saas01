"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  analyzeStudentRiskAction,
} from "../actions/ai-early-intervention.actions";

import type {
  AIEarlyInterventionResult,
} from "../types/ai-early-intervention.types";

type Props = {
  studentId: string;
};

export default function AIEarlyInterventionCard({
  studentId,
}: Props) {
  const [result, setResult] =
    useState<AIEarlyInterventionResult | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);

    const response =
      await analyzeStudentRiskAction(
        studentId,
      );

    if (
      response.success &&
      "result" in response
    ) {
      setResult(response.result);
    } else {
      setError(
        response.message ??
          "Unable to analyze student.",
      );
    }

    setLoading(false);
  }

  const riskLabel =
    result?.riskLevel ?? "NOT ANALYZED";

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />

            <h2 className="font-semibold">
              AI Early Intervention
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Lifetime learning behavior and
            performance risk analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}

          {loading
            ? "Analyzing..."
            : "Analyze Risk"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">
                Risk Level
              </p>

              <p className="mt-2 text-2xl font-bold">
                {riskLabel}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">
                Risk Score
              </p>

              <p className="mt-2 text-2xl font-bold">
                {result.riskScore}/100
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">
                Attendance
              </p>

              <p className="mt-2 text-2xl font-bold">
                {result.attendance.attendanceRate}%
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                Learning
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {result.learning.completionRate}%
                lesson completion
              </p>

              <p className="text-sm text-muted-foreground">
                {result.learning.courseProgress}%
                course progress
              </p>

              {result.learning.daysSinceActivity !==
                null && (
                <p className="text-sm text-muted-foreground">
                  {result.learning.daysSinceActivity}{" "}
                  days since activity
                </p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                Assessments
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Average:{" "}
                {result.assessments.averageScore}%
              </p>

              <p className="text-sm text-muted-foreground">
                Trend:{" "}
                {result.assessments.trend}
              </p>

              <p className="text-sm text-muted-foreground">
                Failed:{" "}
                {result.assessments.failed}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                AI Recommendation
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {result.aiAnalysis.recommendedIntervention}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />

              <h3 className="font-medium">
                Risk Factors
              </h3>
            </div>

            {result.factors.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />

                No significant risk factors
                detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.factors.map(
                  (factor, index) => (
                    <div
                      key={`${factor.factor}-${index}`}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                      <div>
                        <p className="font-medium">
                          {factor.factor}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {factor.evidence}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              AI Summary
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {result.aiAnalysis.summary}
            </p>

            <p className="mt-3 text-sm">
              <span className="font-medium">
                Primary concern:
              </span>{" "}
              {result.aiAnalysis.primaryConcern}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
