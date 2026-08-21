"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";

import { AssessmentSubmissionService } from "../services/assessment-submission.service";

export async function saveAssessmentAnswerAction(data: {
  submissionId: string;
  questionId: string;
  answer: string | null;
}) {
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
      message: "Only students can save assessment answers.",
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

  if (!data.submissionId || !data.questionId) {
    return {
      success: false,
      message: "Submission and question are required.",
    };
  }

  return AssessmentSubmissionService.saveAnswer({
    submissionId: data.submissionId,
    studentId: student.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    questionId: data.questionId,
    answer: data.answer,
  });
}
