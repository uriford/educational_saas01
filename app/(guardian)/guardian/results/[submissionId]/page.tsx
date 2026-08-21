import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import { ResultService } from "@/features/results/services/result.service";
import AssessmentResults from "@/features/results/components/AssessmentResults";
import AssessmentResultDetails from "@/features/results/components/AssessmentResultDetails";

type Props = {
  params: Promise<{
    submissionId: string;
  }>;
};

export default async function GuardianResultDetailPage({
  params,
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

  const { submissionId } = await params;

  if (!submissionId) {
    redirect("/guardian/results");
  }

  /*
   * Security boundary:
   *
   * We first obtain the students explicitly linked to
   * this guardian. The result will only be shown if the
   * submission belongs to one of those students.
   */
  const children = await GuardianService.getChildren(
    session.user.id,
    session.user.organizationId,
  );

  if (children.length === 0) {
    redirect("/guardian/results");
  }

  /*
   * ResultService requires the student ID, so we check
   * the submission against each linked child.
   *
   * The guardian cannot simply provide an arbitrary
   * studentId because it is never trusted from the URL.
   */
  let result: Awaited<
    ReturnType<typeof ResultService.getStudentResult>
  > | null = null;

  let selectedStudentId: string | null = null;

  for (const { student } of children) {
    const candidate =
      await ResultService.getStudentResult({
        submissionId,
        studentId: student.id,
        organizationId: session.user.organizationId,
        branchId: session.user.branchId,
      });

    if (candidate.success && candidate.result) {
      result = candidate;
      selectedStudentId = student.id;
      break;
    }
  }

  if (!result?.success || !result.result || !selectedStudentId) {
    redirect("/guardian/results");
  }

  const selectedChild = children.find(
    ({ student }) => student.id === selectedStudentId,
  )?.student;

  if (!selectedChild) {
    redirect("/guardian/results");
  }

  const fullName =
    `${selectedChild.firstName} ${selectedChild.lastName ?? ""}`.trim();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href={`/guardian/results?studentId=${selectedChild.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Results
      </Link>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Student
        </p>

        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">
            {fullName}
          </h2>

          <p className="text-sm text-muted-foreground">
            ID: {selectedChild.studentId}
          </p>
        </div>
      </section>

      <AssessmentResults
        result={{
          title: result.result.title,
          course: result.result.course,
          status: result.result.status,
          totalMarks: result.result.totalMarks,
          passingMarks: result.result.passingMarks,
          score: result.result.score,
          percentage: result.result.percentage,
          passed: result.result.passed,
          pendingManualGrading:
            result.result.pendingManualGrading,
          questionCount:
            result.result.questionCount,
          answeredCount:
            result.result.answeredCount,
          attemptNumber:
            result.result.attemptNumber,
          submittedAt:
            result.result.submittedAt,
        }}
      />

      <AssessmentResultDetails
        questions={result.result.questions}
      />
    </div>
  );
}
