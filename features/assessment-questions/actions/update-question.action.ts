"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AssessmentQuestionService } from "../services/assessment-question.service";

export async function updateQuestionAction(data: {
  id: string;
  question: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER";
  marks: number;
  options?: string[];
  correctAnswer?: string | null;
  order?: number;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      success: false,
      message: "You are not allowed to update assessment questions.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
    };
  }

  if (!session.user.branchId) {
    return {
      success: false,
      message: "Branch information is missing.",
    };
  }

  if (!data.id) {
    return {
      success: false,
      message: "Question ID is required.",
    };
  }

  if (!data.question?.trim()) {
    return {
      success: false,
      message: "Question text is required.",
    };
  }

  if (!Number.isFinite(data.marks) || data.marks <= 0) {
    return {
      success: false,
      message: "Question marks must be greater than zero.",
    };
  }

  if (
    data.order !== undefined &&
    (!Number.isInteger(data.order) || data.order <= 0)
  ) {
    return {
      success: false,
      message: "Question order must be a positive whole number.",
    };
  }

  return AssessmentQuestionService.update({
    id: data.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    question: data.question.trim(),
    type: data.type,
    marks: data.marks,
    options: data.options,
    correctAnswer: data.correctAnswer?.trim() || null,
    order: data.order,
  });
}
