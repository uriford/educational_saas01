import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import { ResultService } from "@/features/results/services/result.service";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

export default async function GuardianResultsPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const { studentId } = await searchParams;

  const children = await GuardianService.getChildren(
    session.user.id,
    session.user.organizationId,
  );

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight">
            Results
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your children&apos;s assessment results.
          </p>
        </section>

        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">
            No children linked
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            No students are currently linked to your guardian
            account.
          </p>
        </div>
      </div>
    );
  }

  const selectedStudentId =
    studentId && children.some(
      ({ student }) => student.id === studentId,
    )
      ? studentId
      : children[0].student.id;

  const selectedChild = await GuardianService.getChild(
    session.user.id,
    session.user.organizationId,
    selectedStudentId,
  );

  if (!selectedChild) {
    redirect("/guardian/results");
  }

  const resultData = await ResultService.getStudentResults({
    studentId: selectedChild.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });

  const resultSummary = resultData.success
    ? resultData.summary
    : null;

  const results = resultData.success
    ? (resultData.results ?? [])
    : [];

  const fullName =
    `${selectedChild.firstName} ${selectedChild.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Results
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View {fullName}&apos;s assessment performance.
        </p>
      </section>

      {children.length > 1 && (
        <section className="rounded-xl border bg-background p-5">
          <p className="mb-3 text-sm font-medium">
            Select child
          </p>

          <div className="flex flex-wrap gap-2">
            {children.map(({ student }) => {
              const name =
                `${student.firstName} ${student.lastName ?? ""}`.trim();

              const active = student.id === selectedChild.id;

              return (
                <a
                  key={student.id}
                  href={`/guardian/results?studentId=${student.id}`}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  {name}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-background p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Student
            </p>

            <h2 className="text-lg font-semibold">
              {fullName}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            ID: {selectedChild.studentId}
          </p>
        </div>
      </section>

      {!resultData.success ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">
            Unable to load results
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {resultData.message}
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                Completed Assessments
              </p>

              <p className="mt-2 text-3xl font-bold">
                {resultSummary?.total ?? 0}
              </p>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                Passed
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {resultSummary?.passed ?? 0}
              </p>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                Failed
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {resultSummary?.failed ?? 0}
              </p>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                Average Percentage
              </p>

              <p className="mt-2 text-3xl font-bold">
                {resultSummary?.averagePercentage ?? 0}%
              </p>
            </div>
          </section>

          {results.length === 0 ? (
            <div className="rounded-xl border bg-background p-10 text-center">
              <h2 className="font-semibold">
                No results yet
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This student has no completed assessments yet.
              </p>
            </div>
          ) : (
            <section className="rounded-xl border bg-background">
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold">
                  Assessment Results
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Recent completed assessments and scores.
                </p>
              </div>

              <div className="divide-y">
                {results.map((result) => {
                  const statusLabel =
                    result.pendingManualGrading
                      ? "Pending"
                      : result.passed
                        ? "Passed"
                        : "Failed";

                  const statusClass =
                    result.pendingManualGrading
                      ? "bg-yellow-100 text-yellow-800"
                      : result.passed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800";

                  return (
                    <div
                      key={result.submissionId}
                      className="p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {result.title}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {result.course.name}
                            {result.course.code
                              ? ` · ${result.course.code}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Attempt {result.attemptNumber}
                            {result.submittedAt
                              ? ` · ${new Intl.DateTimeFormat(
                                  "en-US",
                                  {
                                    dateStyle: "medium",
                                  },
                                ).format(result.submittedAt)}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-5">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Score
                            </p>

                            <p className="font-semibold">
                              {result.score} / {result.totalMarks}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Percentage
                            </p>

                            <p className="font-semibold">
                              {result.percentage}%
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                          >
                            {statusLabel}
                          </span>

                          <a
                            href={`/guardian/results/${result.submissionId}?studentId=${selectedChild.id}`}
                            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
