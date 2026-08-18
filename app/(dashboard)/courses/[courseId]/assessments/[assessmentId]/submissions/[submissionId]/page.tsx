import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { ResultService } from "@/features/results/services/result.service";
import TeacherSubmissionReview from "@/features/results/components/TeacherSubmissionReview";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
    submissionId: string;
  }>;
};

export default async function TeacherSubmissionPage({
  params,
}: Props) {
  const session = await requireAdmin();

  const {
    courseId,
    assessmentId,
    submissionId,
  } = await params;

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    notFound();
  }

  const result =
    await ResultService.getTeacherSubmission({
      submissionId,
      organizationId:
        session.user.organizationId,
      branchId: session.user.branchId,
    });

  if (
    !result.success ||
    !result.submission
  ) {
    notFound();
  }

  if (
    result.submission.assessment.id !==
      assessmentId ||
    result.submission.assessment.course.id !==
      courseId
  ) {
    notFound();
  }

  return (
    <TeacherSubmissionReview
      submission={result.submission}
      courseId={courseId}
      assessmentId={assessmentId}
    />
  );
}
