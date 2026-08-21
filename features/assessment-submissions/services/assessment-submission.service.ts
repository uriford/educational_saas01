import { AssessmentSubmissionRepository } from "../repository/assessment-submission.repository";

export class AssessmentSubmissionService {
  static async start(data: {
    assessmentId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    try {
      const assessment =
        await AssessmentSubmissionRepository.findAssessmentForStart(
          data.assessmentId,
          data.organizationId,
          data.branchId,
        );

      if (!assessment) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      if (assessment.status !== "PUBLISHED") {
        return {
          success: false,
          message: "This assessment is not currently available.",
        };
      }

      const now = new Date();

      if (assessment.startDate && now < assessment.startDate) {
        return {
          success: false,
          message: "This assessment has not started yet.",
        };
      }

      if (assessment.endDate && now > assessment.endDate) {
        return {
          success: false,
          message: "This assessment is no longer available.",
        };
      }

      const student =
        await AssessmentSubmissionRepository.findStudentForAssessment(
          data.studentId,
          data.organizationId,
          data.branchId,
          data.assessmentId,
        );

      if (!student) {
        return {
          success: false,
          message: "You are not enrolled in this course.",
        };
      }

      const latestSubmission =
        await AssessmentSubmissionRepository.findByAssessmentAndStudent(
          data.assessmentId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (
        latestSubmission &&
        latestSubmission.status === "IN_PROGRESS"
      ) {
        const durationExpired =
          assessment.duration !== null &&
          now.getTime() >=
            latestSubmission.startedAt.getTime() +
              assessment.duration * 60 * 1000;

        const assessmentWindowExpired =
          assessment.endDate !== null &&
          now > assessment.endDate;

        if (!durationExpired && !assessmentWindowExpired) {
          return {
            success: true,
            message: "Assessment resumed.",
            submission: {
            id: latestSubmission.id,
            startedAt: latestSubmission.startedAt,
            answers: latestSubmission.answers.map((answer) => ({
              questionId: answer.questionId,
              answer: answer.answer,
            })),
          },
          };
        }

        const score =
          latestSubmission.answers.reduce(
            (total, answer) =>
              total + Number(answer.marksAwarded ?? 0),
            0,
          );

        const totalMarks = Number(assessment.totalMarks);

        const percentage =
          totalMarks > 0
            ? Number(
                ((score / totalMarks) * 100).toFixed(2),
              )
            : 0;

        const expiredSubmission =
          await AssessmentSubmissionRepository.submit(
            latestSubmission.id,
            data.studentId,
            score,
            percentage,
          );

        return {
          success: true,
          message:
            "Your previous attempt expired and was submitted.",
          submission: expiredSubmission,
        };
      }

      const attempts =
        await AssessmentSubmissionRepository.countAttempts(
          data.assessmentId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (attempts >= assessment.maxAttempts) {
        return {
          success: false,
          message:
            "You have reached the maximum number of attempts for this assessment.",
        };
      }

      const newSubmission =
        await AssessmentSubmissionRepository.create(
          data.assessmentId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      return {
        success: true,
        message: "Assessment started successfully.",
        submission: {
          id: newSubmission.id,
          startedAt: newSubmission.startedAt,
          answers: newSubmission.answers.map((answer) => ({
            questionId: answer.questionId,
            answer: answer.answer,
          })),
        },
      };
    } catch (error) {
      console.error("START ASSESSMENT ERROR:", error);

      return {
        success: false,
        message: "Failed to start assessment.",
      };
    }
  }

  static async saveAnswer(data: {
    submissionId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
    questionId: string;
    answer: string | null;
  }) {
    try {
      const submission =
        await AssessmentSubmissionRepository.findById(
          data.submissionId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "Assessment submission not found.",
        };
      }

      if (submission.studentId !== data.studentId) {
        return {
          success: false,
          message: "You cannot modify this submission.",
        };
      }

      if (submission.status !== "IN_PROGRESS") {
        return {
          success: false,
          message:
            "This assessment has already been submitted.",
        };
      }

      if (submission.assessment.status !== "PUBLISHED") {
        return {
          success: false,
          message:
            "This assessment is no longer available.",
          expired: true,
        };
      }

      const now = new Date();

      const durationExpired =
        submission.assessment.duration !== null &&
        now.getTime() >=
          submission.startedAt.getTime() +
            submission.assessment.duration * 60 * 1000;

      if (durationExpired) {
        return {
          success: false,
          message: "The assessment time has expired.",
          expired: true,
        };
      }

      if (
        submission.assessment.endDate &&
        now > submission.assessment.endDate
      ) {
        return {
          success: false,
          message:
            "The assessment is no longer available.",
          expired: true,
        };
      }

      const question =
        submission.assessment.questions.find(
          (item) => item.id === data.questionId,
        );

      if (!question) {
        return {
          success: false,
          message: "Question not found.",
        };
      }

      const answer = data.answer?.trim() || null;

      let marksAwarded: number | null = null;
      let isCorrect: boolean | null = null;

      if (
        question.type === "MCQ" ||
        question.type === "TRUE_FALSE"
      ) {
        if (!answer) {
          marksAwarded = 0;
          isCorrect = false;
        } else {
          isCorrect =
            answer === question.correctAnswer;

          marksAwarded = isCorrect
            ? Number(question.marks)
            : 0;
        }
      }

      const savedAnswer =
        await AssessmentSubmissionRepository.saveAnswer({
          submissionId: data.submissionId,
          studentId: data.studentId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          questionId: data.questionId,
          answer,
          marksAwarded,
          isCorrect,
        });

      return {
        success: true,
        message: "Answer saved.",
        answer: {
          id: savedAnswer.id,
          submissionId: savedAnswer.submissionId,
          questionId: savedAnswer.questionId,
          answer: savedAnswer.answer,
        },
      };
    } catch (error) {
      console.error(
        "SAVE ASSESSMENT ANSWER ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to save answer.",
      };
    }
  }

  static async submit(data: {
    submissionId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    try {
      const submission =
        await AssessmentSubmissionRepository.findById(
          data.submissionId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "Assessment submission not found.",
        };
      }

      if (submission.studentId !== data.studentId) {
        return {
          success: false,
          message:
            "You cannot submit this assessment.",
        };
      }

      if (submission.status !== "IN_PROGRESS") {
        return {
          success: false,
          message:
            "This assessment has already been submitted.",
          submission,
        };
      }

      const now = new Date();

      const durationExpired =
        submission.assessment.duration !== null &&
        now.getTime() >=
          submission.startedAt.getTime() +
            submission.assessment.duration * 60 * 1000;

      const assessmentWindowExpired =
        submission.assessment.endDate !== null &&
        now > submission.assessment.endDate;

      const totalMarks = Number(
        submission.assessment.totalMarks,
      );

      const score =
        submission.answers.reduce(
          (total, answer) =>
            total + Number(answer.marksAwarded ?? 0),
          0,
        );

      const percentage =
        totalMarks > 0
          ? Number(
              ((score / totalMarks) * 100).toFixed(2),
            )
          : 0;

      const pendingManualGrading =
        submission.assessment.questions.some(
          (question) =>
            (question.type === "SHORT_ANSWER" ||
              question.type === "LONG_ANSWER") &&
            submission.answers.some(
              (answer) =>
                answer.questionId === question.id &&
                answer.marksAwarded === null,
            ),
        );

      const updatedSubmission =
        await AssessmentSubmissionRepository.submit(
          data.submissionId,
          data.studentId,
          score,
          percentage,
        );

      return {
        success: true,
        message:
          durationExpired ||
          assessmentWindowExpired
            ? "Assessment time expired. Your saved answers were submitted."
            : "Assessment submitted successfully.",
        submission: {
          id: updatedSubmission.id,
          status: updatedSubmission.status,
          submittedAt: updatedSubmission.submittedAt,
        },
        pendingManualGrading,
      };
    } catch (error) {
      console.error(
        "SUBMIT ASSESSMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to submit assessment.",
      };
    }
  }
}
