"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AssessmentService } from "../services/assessment.service";

export async function updateAssessmentAction(data: {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration?: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  startDate?: string;
  endDate?: string;
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
      message: "You are not allowed to update assessments.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
    };
  }

  if (!data.id || !data.courseId) {
    return {
      success: false,
      message: "Assessment information is incomplete.",
    };
  }

  if (!data.title.trim()) {
    return {
      success: false,
      message: "Assessment title is required.",
    };
  }

  const course = await AssessmentService.getById(
    data.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!course || course.courseId !== data.courseId) {
    return {
      success: false,
      message: "Assessment not found.",
    };
  }

  const startDate = data.startDate
    ? new Date(data.startDate)
    : null;

  const endDate = data.endDate
    ? new Date(data.endDate)
    : null;

  if (
    (startDate && Number.isNaN(startDate.getTime())) ||
    (endDate && Number.isNaN(endDate.getTime()))
  ) {
    return {
      success: false,
      message: "Invalid assessment date.",
    };
  }

  return AssessmentService.update({
    id: data.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    duration: data.duration ?? null,
    totalMarks: data.totalMarks,
    passingMarks: data.passingMarks,
    maxAttempts: data.maxAttempts,
    status: data.status,
    startDate,
    endDate,
    updatedById: session.user.id,
  });
}
