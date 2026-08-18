import { gemini } from "@/lib/ai/gemini";
import {
  AIEarlyInterventionRepository,
} from "../repository/ai-early-intervention.repository";
import {
  aiEarlyInterventionSchema,
} from "../schemas/ai-early-intervention.schema";
import type {
  AIEarlyInterventionResult,
  AIRiskFactor,
  AIRiskLevel,
} from "../types/ai-early-intervention.types";
import {
  NotificationAutomationService,
} from "@/features/notifications/services/notification-automation.service";
import {
  EmailService,
} from "@/features/notifications/services/email.service";


const MODEL = "gemini-3.6-flash";

function getDaysSince(date: Date | null) {
  if (!date) return null;

  return Math.max(
    0,
    Math.floor(
      (Date.now() - date.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

function getAIRiskLevel(score: number): AIRiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export class AIEarlyInterventionService {
  static async analyze(
    studentId: string,
    organizationId: string,
    branchId: string,
  ): Promise<
    | {
        success: false;
        message: string;
      }
    | {
        success: true;
        result: AIEarlyInterventionResult;
      }
  > {
    const data =
      await AIEarlyInterventionRepository.getLifetimeStudentData(
        studentId,
        organizationId,
        branchId,
      );

    if (!data) {
      return {
        success: false,
        message: "Student not found.",
      };
    }

    const attendances = data.attendances;

    const totalAttendance = attendances.length;

    const present = attendances.filter(
      (a) => a.status === "PRESENT",
    ).length;

    const absent = attendances.filter(
      (a) => a.status === "ABSENT",
    ).length;

    const late = attendances.filter(
      (a) => a.status === "LATE",
    ).length;

    const attendanceRate =
      totalAttendance > 0
        ? Number(
            (
              ((present + late * 0.5) /
                totalAttendance) *
              100
            ).toFixed(2),
          )
        : 100;

    const allLessonProgress =
      data.courseEnrollments.flatMap(
        (enrollment) =>
          enrollment.lessonProgress,
      );

    const totalLessons =
      allLessonProgress.length;

    const completedLessons =
      allLessonProgress.filter(
        (lesson) => lesson.completed,
      ).length;

    const completionRate =
      totalLessons > 0
        ? Number(
            (
              (completedLessons /
                totalLessons) *
              100
            ).toFixed(2),
          )
        : 0;

    const courseProgress =
      data.courseEnrollments.length > 0
        ? Number(
            (
              data.courseEnrollments.reduce(
                (sum, enrollment) =>
                  sum + enrollment.progress,
                0,
              ) /
              data.courseEnrollments.length
            ).toFixed(2),
          )
        : 0;

    const activityDates =
      allLessonProgress
        .map(
          (item) => item.lastViewedAt,
        )
        .filter(
          (date): date is Date =>
            date instanceof Date,
        );

    const latestActivity =
      activityDates.length > 0
        ? activityDates.reduce(
            (latest, current) =>
              current > latest
                ? current
                : latest,
          )
        : null;

    const daysSinceActivity =
      getDaysSince(latestActivity);

    const submissions =
      data.assessmentSubmissions;

    const percentages = submissions
      .map((submission) => {
        if (
          submission.percentage !== null
        ) {
          return Number(
            submission.percentage,
          );
        }

        const totalMarks =
          Number(
            submission.assessment.totalMarks,
          );

        const score =
          submission.score !== null
            ? Number(submission.score)
            : submission.answers.reduce(
                (sum, answer) =>
                  sum +
                  Number(
                    answer.marksAwarded ?? 0,
                  ),
                0,
              );

        return totalMarks > 0
          ? (score / totalMarks) * 100
          : 0;
      });

    const averageScore =
      percentages.length > 0
        ? Number(
            (
              percentages.reduce(
                (a, b) => a + b,
                0,
              ) / percentages.length
            ).toFixed(2),
          )
        : 0;

    const recentScores =
      percentages.slice(0, 3);

    const previousScores =
      percentages.slice(3, 6);

    const recentAverage =
      recentScores.length > 0
        ? Number(
            (
              recentScores.reduce(
                (a, b) => a + b,
                0,
              ) /
              recentScores.length
            ).toFixed(2),
          )
        : 0;

    const previousAverage =
      previousScores.length > 0
        ? Number(
            (
              previousScores.reduce(
                (a, b) => a + b,
                0,
              ) /
              previousScores.length
            ).toFixed(2),
          )
        : 0;

    let trend:
      | "IMPROVING"
      | "STABLE"
      | "DECLINING"
      | "INSUFFICIENT_DATA" =
      "INSUFFICIENT_DATA";

    if (
      recentScores.length >= 2 &&
      previousScores.length >= 2
    ) {
      const difference =
        recentAverage -
        previousAverage;

      if (difference <= -10) {
        trend = "DECLINING";
      } else if (difference >= 10) {
        trend = "IMPROVING";
      } else {
        trend = "STABLE";
      }
    }

    const passed =
      submissions.filter(
        (submission) => {
          const percentage =
            submission.percentage !== null
              ? Number(
                  submission.percentage,
                )
              : 0;

          return (
            percentage >=
            Number(
              submission.assessment
                .passingMarks,
            ) /
              Number(
                submission.assessment
                  .totalMarks,
              ) *
              100
          );
        },
      ).length;

    const failed =
      Math.max(
        0,
        submissions.length - passed,
      );

    const factors: AIRiskFactor[] = [];

    let riskScore = 0;

    if (
      totalAttendance > 0 &&
      attendanceRate < 60
    ) {
      riskScore += 30;

      factors.push({
        factor: "Very low attendance",
        score: 30,
        evidence: `${attendanceRate}% effective attendance across ${totalAttendance} recorded sessions.`,
      });
    } else if (
      totalAttendance > 0 &&
      attendanceRate < 75
    ) {
      riskScore += 20;

      factors.push({
        factor: "Low attendance",
        score: 20,
        evidence: `${attendanceRate}% effective attendance across ${totalAttendance} recorded sessions.`,
      });
    } else if (
      totalAttendance > 0 &&
      attendanceRate < 85
    ) {
      riskScore += 10;

      factors.push({
        factor: "Attendance below ideal",
        score: 10,
        evidence: `${attendanceRate}% effective attendance.`,
      });
    }

    if (completionRate < 40) {
      riskScore += 20;

      factors.push({
        factor: "Low lesson completion",
        score: 20,
        evidence: `Only ${completionRate}% of tracked lessons are completed.`,
      });
    } else if (completionRate < 65) {
      riskScore += 10;

      factors.push({
        factor: "Slow lesson progress",
        score: 10,
        evidence: `${completionRate}% lesson completion.`,
      });
    }

    if (
      daysSinceActivity !== null &&
      daysSinceActivity >= 14
    ) {
      riskScore += 25;

      factors.push({
        factor: "Extended inactivity",
        score: 25,
        evidence: `No lesson activity for ${daysSinceActivity} days.`,
      });
    } else if (
      daysSinceActivity !== null &&
      daysSinceActivity >= 7
    ) {
      riskScore += 15;

      factors.push({
        factor: "Recent inactivity",
        score: 15,
        evidence: `No lesson activity for ${daysSinceActivity} days.`,
      });
    }

    if (
      submissions.length >= 2 &&
      averageScore < 50
    ) {
      riskScore += 25;

      factors.push({
        factor: "Poor assessment performance",
        score: 25,
        evidence: `Lifetime assessment average is ${averageScore}%.`,
      });
    } else if (
      submissions.length >= 2 &&
      averageScore < 65
    ) {
      riskScore += 15;

      factors.push({
        factor: "Below-average assessment performance",
        score: 15,
        evidence: `Lifetime assessment average is ${averageScore}%.`,
      });
    }

    if (trend === "DECLINING") {
      riskScore += 20;

      factors.push({
        factor: "Declining assessment trend",
        score: 20,
        evidence: `Recent average ${recentAverage}% vs previous average ${previousAverage}%.`,
      });
    }

    if (
      submissions.length >= 3 &&
      failed >= 2
    ) {
      riskScore += 10;

      factors.push({
        factor: "Repeated assessment failures",
        score: 10,
        evidence: `${failed} of ${submissions.length} assessments were not passed.`,
      });
    }

    riskScore = Math.min(
      100,
      riskScore,
    );

    const riskLevel =
      getAIRiskLevel(riskScore);

    const evidence = {
      student: {
        id: data.id,
        studentId: data.studentId,
        name: `${data.firstName} ${data.lastName ?? ""}`.trim(),
      },

      riskLevel,
      riskScore,

      attendance: {
        total: totalAttendance,
        present,
        absent,
        late,
        attendanceRate,
      },

      learning: {
        totalLessons,
        completedLessons,
        completionRate,
        courseProgress,
        daysSinceActivity,
      },

      assessments: {
        total: submissions.length,
        averageScore,
        passed,
        failed,
        recentAverage,
        previousAverage,
        trend,
      },

      factors,
    };

    const prompt = `
You are the AI early-intervention engine of a professional educational SaaS.

Your task is to interpret objective student-risk evidence.

DO NOT invent facts.

DO NOT diagnose medical, psychological, or personal conditions.

Use ONLY the supplied evidence.

The objective risk score and risk level were calculated by the platform.
You must NOT change them.

Provide practical educational intervention advice.

Return ONLY valid JSON.

Required structure:

{
  "summary": "string",
  "primaryConcern": "string",
  "recommendedIntervention": "string",
  "urgency": "LOW | MEDIUM | HIGH | URGENT"
}

STUDENT RISK EVIDENCE:

${JSON.stringify(evidence, null, 2)}
`;

    let aiAnalysis = {
      summary:
        "Risk analysis generated from student learning activity.",
      primaryConcern:
        factors[0]?.factor ??
        "No significant risk factor detected.",
      recommendedIntervention:
        riskLevel === "LOW"
          ? "Continue normal monitoring and learning support."
          : "Review the student's recent learning activity and provide targeted academic support.",
      urgency:
        riskLevel === "CRITICAL"
          ? "URGENT"
          : riskLevel === "HIGH"
            ? "HIGH"
            : riskLevel === "MEDIUM"
              ? "MEDIUM"
              : "LOW",
    } as {
      summary: string;
      primaryConcern: string;
      recommendedIntervention: string;
      urgency:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT";
    };

    try {
      const response =
        await gemini.interactions.create({
          model: MODEL,
          input: prompt,
        });

      const output =
        typeof response.output_text === "string"
          ? response.output_text.trim()
          : "";

      if (output) {
        const cleaned = output
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const firstBrace =
          cleaned.indexOf("{");

        const lastBrace =
          cleaned.lastIndexOf("}");

        if (
          firstBrace !== -1 &&
          lastBrace !== -1
        ) {
          const parsed = JSON.parse(
            cleaned.slice(
              firstBrace,
              lastBrace + 1,
            ),
          );

          const validation =
            aiEarlyInterventionSchema.safeParse(
              parsed,
            );

          if (validation.success) {
            aiAnalysis =
              validation.data;
          }
        }
      }
    } catch (error) {
      console.error(
        "AI EARLY INTERVENTION ANALYSIS ERROR:",
        error,
      );
    }

    await AIEarlyInterventionRepository.upsert(
      studentId,
      organizationId,
      branchId,
      {
        riskScore,
        riskLevel,
        reasons: factors,
        recommendedActions: {
          recommendedIntervention:
            aiAnalysis.recommendedIntervention,
          urgency: aiAnalysis.urgency,
          primaryConcern:
            aiAnalysis.primaryConcern,
        },
        summary: aiAnalysis.summary,
        nextAction:
          aiAnalysis.recommendedIntervention,
      },
    );

    const savedAssessment =
      await AIEarlyInterventionRepository.get(
        studentId,
        organizationId,
        branchId,
      );

    // -----------------------------------------------------
    // AI EARLY-INTERVENTION NOTIFICATION COOLDOWN
    // -----------------------------------------------------
    //
    // LOW-risk students do not trigger alerts.
    //
    // MEDIUM/HIGH/CRITICAL students can trigger an
    // administrator notification, but only once every
    // 14 days.
    //
    // The cooldown is based on the last notification,
    // NOT the last AI analysis.
    //

    const notificationCooldownMs =
      14 * 24 * 60 * 60 * 1000;

    const now = new Date();

    const notificationEligible =
      riskLevel === "MEDIUM" ||
      riskLevel === "HIGH" ||
      riskLevel === "CRITICAL";

    const lastNotificationAt =
      savedAssessment?.lastNotificationAt ?? null;

    const cooldownExpired =
      !lastNotificationAt ||
      now.getTime() -
        lastNotificationAt.getTime() >=
        notificationCooldownMs;

    if (
      notificationEligible &&
      cooldownExpired
    ) {
      const notificationPeriod =
        Math.floor(
          now.getTime() /
            notificationCooldownMs,
        );

      await NotificationAutomationService.notifyAdmins({
        organizationId,
        branchId,

        type:
          riskLevel === "CRITICAL" ||
          riskLevel === "HIGH"
            ? "WARNING"
            : "INFO",

        title:
          "AI Early Intervention Alert",

        message:
          `${evidence.student.name} has been identified as ` +
          `${riskLevel} risk. ` +
          `${aiAnalysis.primaryConcern}`,

        href:
          `/dashboard/students/${studentId}/ai-early-intervention`,

        dedupeKey:
          `ai-early-intervention:${organizationId}:${studentId}:${notificationPeriod}`,
      });

      // -----------------------------------------------------
      // Guardian email notification
      // -----------------------------------------------------
      //
      // The guardian email comes directly from the student's
      // stored profile. The AI never invents or generates it.
      //
      // Email is optional. If no guardian email exists, the
      // administrator notification above still works.
      //

      if (data.guardianEmail?.trim()) {
        const guardianEmail =
          data.guardianEmail.trim();

        const guardianEmailResult =
          await EmailService.send({
            to: guardianEmail,

            subject:
              `Student Support Alert - ${riskLevel} Risk`,

            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Student Support Alert</h2>

                <p>
                  Dear Guardian,
                </p>

                <p>
                  Our learning support system has identified
                  <strong>${evidence.student.name}</strong>
                  as currently showing
                  <strong>${riskLevel.toLowerCase()} risk indicators</strong>.
                </p>

                <p>
                  <strong>Primary concern:</strong>
                  ${aiAnalysis.primaryConcern}
                </p>

                <p>
                  <strong>AI assessment summary:</strong>
                  ${aiAnalysis.summary}
                </p>

                <p>
                  <strong>Recommended action:</strong>
                  ${aiAnalysis.recommendedIntervention}
                </p>

                <p>
                  We recommend contacting the student's
                  academic support team to discuss the situation
                  and determine appropriate next steps.
                </p>

                <p>
                  This message was generated from the student's
                  learning and performance indicators and is
                  intended to support early intervention.
                </p>

                <p>
                  Regards,<br />
                  American Council
                </p>
              </div>
            `,

            text:
              `Student Support Alert

` +
              `Dear Guardian,

` +
              `${evidence.student.name} has been identified as ` +
              `${riskLevel.toLowerCase()} risk.

` +
              `Primary concern: ${aiAnalysis.primaryConcern}

` +
              `AI assessment summary: ${aiAnalysis.summary}

` +
              `Recommended action: ${aiAnalysis.recommendedIntervention}

` +
              `We recommend contacting the student's academic support team ` +
              `to discuss the situation and determine appropriate next steps.

` +
              `Regards,
American Council`,
          });

        if (!guardianEmailResult.success) {
          console.error(
            "AI EARLY INTERVENTION GUARDIAN EMAIL ERROR:",
            guardianEmailResult.message,
          );
        }
      }

      await AIEarlyInterventionRepository.markNotificationSent(
        studentId,
        organizationId,
        branchId,
      );
    }

    return {
      success: true,

      result: {
        riskLevel,
        riskScore,

        factors,

        attendance: {
          total: totalAttendance,
          present,
          absent,
          late,
          attendanceRate,
        },

        learning: {
          totalLessons,
          completedLessons,
          completionRate,
          courseProgress,
          daysSinceActivity,
        },

        assessments: {
          total: submissions.length,
          averageScore,
          passed,
          failed,
          recentAverage,
          previousAverage,
          trend,
        },

        aiAnalysis,

        generatedAt:
          new Date().toISOString(),
      },
    };
  }
}
