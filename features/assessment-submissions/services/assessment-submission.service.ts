import { AssessmentSubmissionRepository } from "../repository/assessment-submission.repository";

export class AssessmentSubmissionService {
  static async start(data: {
    assessmentId: string;
    studentId: string;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const submission =
        await AssessmentSubmissionRepository.findByAssessmentAndStudent(
          data.assessmentId,
          data.studentId,
        );

      if (submission) {
        if (submission.status === "IN_PROGRESS") {
          return {
            success: true,
            message: "Assessment resumed.",
            submission,
          };
        }

        return {
          success: false,
          message:
            "You have already submitted this assessment.",
        };
      }

      const assessment =
        await AssessmentSubmissionRepository.findAssessmentForStart?.(
          data.assessmentId,
        );

      if (!assessment) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      if (
        assessment.organizationId !== data.organizationId ||
        assessment.branchId !== data.branchId
      ) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      if (assessment.deletedAt) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      if (assessment.status !== "PUBLISHED") {
        return {
          success: false,
          message:
            "This assessment is not currently available.",
        };
      }

      const now = new Date();

      if (
        assessment.startDate &&
        now < assessment.startDate
      ) {
        return {
          success: false,
          message:
            "This assessment has not started yet.",
        };
      }

      if (
        assessment.endDate &&
        now > assessment.endDate
      ) {
        return {
          success: false,
          message:
            "This assessment is no longer available.",
        };
      }

      const newSubmission =
        await AssessmentSubmissionRepository.create(
          data.assessmentId,
          data.studentId,
        );

      return {
        success: true,
        message: "Assessment started successfully.",
        submission: newSubmission,
      };
    } catch (error) {
      console.error(
        "START ASSESSMENT ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to start assessment.",
      };
    }
  }
}