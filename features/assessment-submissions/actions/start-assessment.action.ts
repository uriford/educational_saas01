"use server";

import { auth } from "@/auth";
import { StudentService } from "@/features/students/services/student.service";
import { ROLES } from "@/features/auth/roles";

import { AssessmentSubmissionService } from "../services/assessment-submission.service";

export async function startAssessmentAction(
  assessmentId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== ROLES.STUDENT) {
    return {
      success: false,
      message: "Only students can start assessments.",
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

  if (!assessmentId) {
    return {
      success: false,
      message: "Assessment ID is required.",
    };
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return {
      success: false,
      message: "Student profile not found.",
    };
  }

  return AssessmentSubmissionService.start({
    assessmentId,
    studentId: student.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}