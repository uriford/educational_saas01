import { ResultRepository } from "../repository/result.repository";

export class ResultService {
  static async getAssessmentHistory(data: {
    assessmentId: string;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const submissions =
        await ResultRepository.findAssessmentHistory(
          data.assessmentId,
          data.organizationId,
          data.branchId,
        );

      const results = submissions.map((submission) => {
        const answeredCount = submission.answers.filter(
          (answer) =>
            answer.answer !== null &&
            answer.answer.trim().length > 0,
        ).length;

        const manualGradingPending =
          submission.answers.some(
            (answer) =>
              (answer.question.type === "SHORT_ANSWER" ||
                answer.question.type === "LONG_ANSWER") &&
              answer.marksAwarded === null,
          );

        const score =
          submission.score !== null
            ? Number(submission.score)
            : submission.answers.reduce(
                (total, answer) =>
                  total +
                  Number(answer.marksAwarded ?? 0),
                0,
              );

        const totalMarks = Number(
          submission.assessment.totalMarks,
        );

        const percentage =
          submission.percentage !== null
            ? Number(submission.percentage)
            : totalMarks > 0
              ? Number(
                  ((score / totalMarks) * 100).toFixed(2),
                )
              : 0;

        const passed =
          !manualGradingPending &&
          score >=
            Number(submission.assessment.passingMarks);

        return {
          id: submission.id,
          studentId: submission.student.id,
          studentCode: submission.student.studentId,
          studentName:
            `${submission.student.firstName} ${submission.student.lastName ?? ""}`.trim(),
          status: submission.status,
          startedAt: submission.startedAt,
          submittedAt: submission.submittedAt,
          score,
          percentage,
          answeredCount,
          questionCount: submission.answers.length,
          manualGradingPending,
          passed,
          createdAt: submission.createdAt,
        };
      });

      const submittedResults = results.filter(
        (result) =>
          result.status === "SUBMITTED" ||
          result.status === "GRADED",
      );

      const averageScore =
        submittedResults.length > 0
          ? Number(
              (
                submittedResults.reduce(
                  (total, result) =>
                    total + result.score,
                  0,
                ) / submittedResults.length
              ).toFixed(2),
            )
          : 0;

      const averagePercentage =
        submittedResults.length > 0
          ? Number(
              (
                submittedResults.reduce(
                  (total, result) =>
                    total + result.percentage,
                  0,
                ) / submittedResults.length
              ).toFixed(2),
            )
          : 0;

      const passedCount = submittedResults.filter(
        (result) => result.passed,
      ).length;

      const failedCount = submittedResults.filter(
        (result) =>
          !result.passed &&
          !result.manualGradingPending,
      ).length;

      return {
        success: true,
        history: {
          submissions: results,
          totalSubmissions: results.length,
          completedSubmissions:
            submittedResults.length,
          inProgressSubmissions: results.filter(
            (result) =>
              result.status === "IN_PROGRESS",
          ).length,
          averageScore,
          averagePercentage,
          passedCount,
          failedCount,
          pendingManualGradingCount:
            results.filter(
              (result) =>
                result.manualGradingPending,
            ).length,
        },
      };
    } catch (error) {
      console.error(
        "GET ASSESSMENT HISTORY ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to load assessment history.",
      };
    }
  }

  static async getTeacherSubmission(data: {
    submissionId: string;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const submission =
        await ResultRepository.findSubmissionForTeacher(
          data.submissionId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "Submission not found.",
        };
      }

      if (submission.status === "IN_PROGRESS") {
        return {
          success: false,
          message:
            "This assessment is still in progress.",
        };
      }

      const answersByQuestion = new Map(
        submission.answers.map((answer) => [
          answer.questionId,
          answer,
        ]),
      );

      const questions =
        submission.assessment.questions.map(
          (question) => {
            const answer =
              answersByQuestion.get(question.id);

            return {
              id: question.id,
              question: question.question,
              type: question.type,
              marks: Number(question.marks),
              options: question.options,
              correctAnswer:
                question.correctAnswer,
              answer: answer?.answer ?? null,
              marksAwarded:
                answer?.marksAwarded !== null &&
                answer?.marksAwarded !== undefined
                  ? Number(answer.marksAwarded)
                  : null,
              isCorrect:
                answer?.isCorrect ?? null,
            };
          },
        );

      const score =
        submission.score !== null
          ? Number(submission.score)
          : submission.answers.reduce(
              (total, answer) =>
                total +
                Number(answer.marksAwarded ?? 0),
              0,
            );

      const totalMarks = Number(
        submission.assessment.totalMarks,
      );

      const percentage =
        submission.percentage !== null
          ? Number(submission.percentage)
          : totalMarks > 0
            ? Number(
                ((score / totalMarks) * 100).toFixed(2),
              )
            : 0;

      const pendingManualGrading =
        questions.some(
          (question) =>
            (question.type === "SHORT_ANSWER" ||
              question.type === "LONG_ANSWER") &&
            question.answer !== null &&
            question.marksAwarded === null,
        );

      return {
        success: true,
        submission: {
          id: submission.id,
          status: submission.status,
          startedAt: submission.startedAt,
          submittedAt: submission.submittedAt,
          createdAt: submission.createdAt,
          student: submission.student,
          assessment: {
            id: submission.assessment.id,
            title: submission.assessment.title,
            description:
              submission.assessment.description,
            course: submission.assessment.course,
            totalMarks,
            passingMarks: Number(
              submission.assessment.passingMarks,
            ),
          },
          score,
          percentage,
          pendingManualGrading,
          passed:
            !pendingManualGrading &&
            score >=
              Number(
                submission.assessment.passingMarks,
              ),
          answeredCount: questions.filter(
            (question) =>
              question.answer !== null &&
              question.answer.trim().length > 0,
          ).length,
          questionCount: questions.length,
          questions,
        },
      };
    } catch (error) {
      console.error(
        "GET TEACHER SUBMISSION ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to load submission.",
      };
    }
  }

  static async gradeAnswer(data: {
    submissionId: string;
    questionId: string;
    marksAwarded: number;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const submission =
        await ResultRepository.findSubmissionForTeacher(
          data.submissionId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "Submission not found.",
        };
      }

      const result =
        await ResultRepository.gradeAnswer({
          submissionId: data.submissionId,
          questionId: data.questionId,
          marksAwarded: data.marksAwarded,
          organizationId: data.organizationId,
          branchId: data.branchId,
        });

      return {
        success: true,
        message: result.pendingManualGrading
          ? "Grade saved successfully."
          : "Grade saved. Assessment is now fully graded.",
      };
    } catch (error) {
      console.error(
        "GRADE ASSESSMENT ANSWER ERROR:",
        error,
      );

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save grade.",
      };
    }
  }

  static async getStudentResults(data: {
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    try {
      if (!data.studentId) {
        return {
          success: false,
          message: "Student ID is required.",
        };
      }

      if (!data.organizationId) {
        return {
          success: false,
          message: "Organization ID is required.",
        };
      }

      const submissions =
        await ResultRepository.findStudentResults(
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      /*
       * Build attempt numbers without issuing one database
       * query per submission.
       */
      const attemptCounters = new Map<string, number>();

      const orderedForAttempts = [...submissions].sort(
        (a, b) =>
          a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const attemptNumbers = new Map<string, number>();

      for (const submission of orderedForAttempts) {
        const current =
          (attemptCounters.get(
            submission.assessment.id,
          ) ?? 0) + 1;

        attemptCounters.set(
          submission.assessment.id,
          current,
        );

        attemptNumbers.set(
          submission.id,
          current,
        );
      }

      const results = submissions.map((submission) => {
        const totalMarks = Number(
          submission.assessment.totalMarks,
        );

        const passingMarks = Number(
          submission.assessment.passingMarks,
        );

        const score =
          submission.score !== null
            ? Number(submission.score)
            : submission.answers.reduce(
                (total, answer) =>
                  total +
                  Number(answer.marksAwarded ?? 0),
                0,
              );

        const percentage =
          submission.percentage !== null
            ? Number(submission.percentage)
            : totalMarks > 0
              ? Number(
                  ((score / totalMarks) * 100).toFixed(2),
                )
              : 0;

        const pendingManualGrading =
          submission.answers.some(
            (answer) =>
              (answer.question.type === "SHORT_ANSWER" ||
                answer.question.type === "LONG_ANSWER") &&
              answer.marksAwarded === null,
          );

        const passed =
          !pendingManualGrading &&
          score >= passingMarks;

        return {
          submissionId: submission.id,
          assessmentId: submission.assessment.id,
          title: submission.assessment.title,
          course: submission.assessment.course,
          totalMarks,
          passingMarks,
          score,
          percentage,
          passed,
          pendingManualGrading,
          status: submission.status,
          attemptNumber:
            attemptNumbers.get(submission.id) ?? 1,
          submittedAt: submission.submittedAt,
          createdAt: submission.createdAt,
        };
      });

      const completedResults = results.filter(
        (result) =>
          result.status === "SUBMITTED" ||
          result.status === "GRADED",
      );

      const passedCount = completedResults.filter(
        (result) =>
          result.passed &&
          !result.pendingManualGrading,
      ).length;

      const failedCount = completedResults.filter(
        (result) =>
          !result.passed &&
          !result.pendingManualGrading,
      ).length;

      const pendingCount = completedResults.filter(
        (result) =>
          result.pendingManualGrading,
      ).length;

      const averagePercentage =
        completedResults.length > 0
          ? Number(
              (
                completedResults.reduce(
                  (total, result) =>
                    total + result.percentage,
                  0,
                ) / completedResults.length
              ).toFixed(2),
            )
          : 0;

      return {
        success: true,
        results,
        summary: {
          total: completedResults.length,
          passed: passedCount,
          failed: failedCount,
          pending: pendingCount,
          averagePercentage,
        },
      };
    } catch (error) {
      console.error(
        "GET STUDENT RESULTS ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to load student results.",
      };
    }
  }

  static async getStudentResult(data: {
    submissionId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    try {
      if (!data.submissionId) {
        return {
          success: false,
          message: "Submission ID is required.",
        };
      }

      const submission =
        await ResultRepository.findSubmissionForStudent(
          data.submissionId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "Assessment result not found.",
        };
      }

      if (
        submission.status !== "SUBMITTED" &&
        submission.status !== "GRADED"
      ) {
        return {
          success: false,
          message:
            "This assessment has not been submitted yet.",
        };
      }

      const totalMarks = Number(
        submission.assessment.totalMarks,
      );

      const passingMarks = Number(
        submission.assessment.passingMarks,
      );

      const score =
        submission.score !== null
          ? Number(submission.score)
          : 0;

      const percentage =
        submission.percentage !== null
          ? Number(submission.percentage)
          : totalMarks > 0
            ? Number(
                ((score / totalMarks) * 100).toFixed(2),
              )
            : 0;

      const questions =
        submission.assessment.questions;

      const answersByQuestion = new Map(
        submission.answers.map((answer) => [
          answer.questionId,
          answer,
        ]),
      );

      const pendingManualGrading =
        questions.some(
          (question) =>
            (question.type === "SHORT_ANSWER" ||
              question.type === "LONG_ANSWER") &&
            answersByQuestion.get(question.id)
              ?.marksAwarded === null,
        );

      const passed =
        submission.status === "GRADED"
          ? score >= passingMarks
          : !pendingManualGrading &&
            score >= passingMarks;

      const questionResults =
        questions.map((question) => {
          const answer =
            answersByQuestion.get(question.id);

          return {
            id: question.id,
            question: question.question,
            type: question.type,
            marks: Number(question.marks),
            correctAnswer:
              question.correctAnswer,
            answer: answer?.answer ?? null,
            marksAwarded:
              answer?.marksAwarded !== null &&
              answer?.marksAwarded !== undefined
                ? Number(answer.marksAwarded)
                : null,
            isCorrect:
              answer?.isCorrect ?? null,
          };
        });

      const answeredCount =
        questionResults.filter(
          (question) =>
            question.answer !== null &&
            question.answer.trim().length > 0,
        ).length;

      return {
        success: true,
        result: {
          submissionId: submission.id,
          status: submission.status,
          assessmentId: submission.assessment.id,
          title: submission.assessment.title,
          description:
            submission.assessment.description,
          course: submission.assessment.course,
          totalMarks,
          passingMarks,
          score,
          percentage,
          passed,
          pendingManualGrading,
          startedAt: submission.startedAt,
          submittedAt: submission.submittedAt,
          attemptNumber:
            await ResultRepository.getAttemptNumber(
              submission.assessment.id,
              data.studentId,
              submission.createdAt,
              data.organizationId,
              data.branchId,
            ),
          questionCount: questions.length,
          answeredCount,
          questions: questionResults,
        },
      };
    } catch (error) {
      console.error(
        "GET STUDENT RESULT ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to load assessment result.",
      };
    }
  }

  static async getLatestStudentResult(data: {
    assessmentId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    try {
      const submission =
        await ResultRepository.findLatestSubmissionForStudent(
          data.assessmentId,
          data.studentId,
          data.organizationId,
          data.branchId,
        );

      if (!submission) {
        return {
          success: false,
          message: "No submitted result found.",
        };
      }

      return this.getStudentResult({
        submissionId: submission.id,
        studentId: data.studentId,
        organizationId: data.organizationId,
        branchId: data.branchId,
      });
    } catch (error) {
      console.error(
        "GET LATEST STUDENT RESULT ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to load assessment result.",
      };
    }
  }
}
