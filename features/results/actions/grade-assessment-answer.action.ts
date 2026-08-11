"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { ResultService } from "../services/result.service";

export async function gradeAssessmentAnswerAction(data: {
  submissionId: string;
  questionId: string;
  marksAwarded: number;
}) {
  const session = await requireAdmin();

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message:
        "Organization or branch information is missing.",
    };
  }

  return ResultService.gradeAnswer({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}
