import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { ResultService } from "@/features/results/services/result.service";
import AssessmentResults from "@/features/results/components/AssessmentResults";
import AssessmentResultDetails from "@/features/results/components/AssessmentResultDetails";

type Props = {
  params: Promise<{
    assessmentId: string;
  }>;
  searchParams: Promise<{
    submission?: string;
  }>;
};

export default async function StudentAssessmentResultPage({
  params,
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const { assessmentId } = await params;
  const { submission } = await searchParams;

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    redirect("/login");
  }

  const result = submission
    ? await ResultService.getStudentResult({
        submissionId: submission,
        studentId: student.id,
        organizationId: session.user.organizationId,
        branchId: session.user.branchId,
      })
    : await ResultService.getLatestStudentResult({
        assessmentId,
        studentId: student.id,
        organizationId: session.user.organizationId,
        branchId: session.user.branchId,
      });

  if (!result.success || !result.result) {
    redirect(
      `/student/assessments/${assessmentId}`,
    );
  }

  if (result.result.assessmentId !== assessmentId) {
    redirect("/student/courses");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href={`/student/courses/${result.result.course.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Course
      </Link>

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
