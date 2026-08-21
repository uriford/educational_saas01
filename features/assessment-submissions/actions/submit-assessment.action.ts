"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";

import { AssessmentSubmissionService } from "../services/assessment-submission.service";

export async function submitAssessmentAction(
  submissionId: string,
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
      message: "Only students can submit assessments.",
    };
  }

  
  if (!submissionId) {
    return {
      success: false,
      message: "Submission ID is required.",
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

  return AssessmentSubmissionService.submit({
    submissionId,
    studentId: student.id,
  });
}
