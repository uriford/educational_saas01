"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { ResultService } from "../services/result.service";

export async function gradeAssessmentAnswerAction(data: {
  submissionId: string;
  questionId: string;
  marksAwarded: number;
}) {
  const session = await requireAdmin();
return ResultService.gradeAnswer({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}
