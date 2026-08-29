import { gemini } from "@/lib/ai/gemini";
import {
  AIPersonalizationRepository,
} from "../repository/ai-personalization.repository";
import {
  AIPersonalizationResult,
} from "../types/ai-personalization.types";
import {
  aiPersonalizationSchema,
} from "../schemas/ai-personalization.schema";

const MODEL = "gemini-3.6-flash";

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1
  ) {
    throw new Error(
      "AI returned invalid personalization data.",
    );
  }

  try {
    return JSON.parse(
      cleaned.slice(firstBrace, lastBrace + 1),
    );
  } catch {
    throw new Error(
      "AI returned malformed personalization JSON.",
    );
  }
}

export class AIPersonalizationService {
  static async generate(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId: string | null | undefined,
  ) {
    const data =
      await AIPersonalizationRepository.getStudentCourseData(
        studentId,
        courseId,
        organizationId,
        branchId,
      );

    if (!data) {
      return {
        success: false,
        message:
          "Student is not enrolled in this course.",
      };
    }

    const lessonProgress =
      data.enrollment.lessonProgress.map(
        (item) => ({
          lessonId: item.lessonId,
          title: item.lesson.title,
          type: item.lesson.type,
          completed: item.completed,
          lastViewedAt:
            item.lastViewedAt,
          completedAt:
            item.completedAt,
        }),
      );

    const assessments =
      data.submissions.map(
        (submission) => {
          const totalMarks = Number(
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

          const percentage =
            submission.percentage !== null
              ? Number(
                  submission.percentage,
                )
              : totalMarks > 0
                ? Number(
                    (
                      (score / totalMarks) *
                      100
                    ).toFixed(2),
                  )
                : 0;

          return {
            assessmentId:
              submission.assessment.id,
            title:
              submission.assessment.title,
            score,
            totalMarks,
            percentage,
            answers:
              submission.answers.map(
                (answer) => ({
                  questionId:
                    answer.question.id,
                  question:
                    answer.question.question,
                  type:
                    answer.question.type,
                  marks:
                    Number(
                      answer.question.marks,
                    ),
                  marksAwarded:
                    answer.marksAwarded !==
                    null
                      ? Number(
                          answer.marksAwarded,
                        )
                      : null,
                  isCorrect:
                    answer.isCorrect,
                }),
              ),
          };
        },
      );

    const courseLessons =
      data.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description:
          lesson.description,
        type: lesson.type,
        order: lesson.order,
        duration: lesson.duration,
      }));

    const prompt = `
You are an AI learning personalization engine
inside a professional educational SaaS platform.

Analyze ONLY the supplied student/course data.

Your job is to identify:
1. The student's current learning level.
2. Their strongest demonstrated areas.
3. Their knowledge gaps.
4. Which existing lessons should be prioritized.
5. The most useful next learning action.

IMPORTANT RULES:

- Do not invent lessons.
- Recommendations must use lesson IDs/titles supplied below.
- Do not claim a student knows something unless supported by data.
- Distinguish incomplete learning from poor assessment performance.
- Question-level performance should be used when available.
- Be concise and actionable.
- Return ONLY valid JSON.
- Do not wrap JSON in markdown.

Required JSON structure:

{
  "learningLevel": "BEGINNER | DEVELOPING | PROFICIENT | ADVANCED",
  "strengths": [
    {
      "area": "string",
      "evidence": "string"
    }
  ],
  "knowledgeGaps": [
    {
      "area": "string",
      "evidence": "string",
      "severity": "LOW | MEDIUM | HIGH"
    }
  ],
  "recommendations": [
    {
      "lessonId": "string or null",
      "lessonTitle": "string",
      "reason": "string",
      "priority": "LOW | MEDIUM | HIGH"
    }
  ],
  "summary": "string",
  "nextAction": "string"
}

COURSE:

${JSON.stringify(data.enrollment.course, null, 2)}

AVAILABLE LESSONS:

${JSON.stringify(courseLessons, null, 2)}

STUDENT LESSON PROGRESS:

${JSON.stringify(lessonProgress, null, 2)}

ASSESSMENT PERFORMANCE:

${JSON.stringify(assessments, null, 2)}
`;

    const response =
      await gemini.interactions.create({
        model: MODEL,
        input: prompt,
      });

    const output =
      typeof response.output_text === "string"
        ? response.output_text
        : "";

    if (!output) {
      throw new Error(
        "Gemini returned an empty personalization response.",
      );
    }

    const parsed = extractJson(output);

    const validation =
      aiPersonalizationSchema.safeParse(parsed);

    if (!validation.success) {
      console.error(
        "AI PERSONALIZATION VALIDATION ERROR:",
        validation.error.flatten(),
      );

      throw new Error(
        "Gemini returned invalid personalization data.",
      );
    }

    const result: AIPersonalizationResult =
      validation.data;

    /*
     * AI output is advisory, never authoritative.
     *
     * Recommendations must reference real published
     * lessons from this course. We therefore validate
     * every lessonId against the lesson list supplied
     * to the model.
     */
    const lessonMap = new Map(
      courseLessons.map((lesson) => [
        lesson.id,
        lesson,
      ]),
    );

    const safeRecommendations =
      result.recommendations
        .filter((recommendation) => {
          if (recommendation.lessonId === null) {
            return true;
          }

          return lessonMap.has(
            recommendation.lessonId,
          );
        })
        .map((recommendation) => {
          if (recommendation.lessonId === null) {
            return recommendation;
          }

          const lesson =
            lessonMap.get(
              recommendation.lessonId,
            );

          if (!lesson) {
            return recommendation;
          }

          return {
            ...recommendation,
            lessonTitle: lesson.title,
          };
        });

    const safeResult: AIPersonalizationResult = {
      ...result,
      recommendations: safeRecommendations,
    };

    await AIPersonalizationRepository.upsert(
      studentId,
      courseId,
      organizationId,
      branchId,
      {
        learningLevel:
          safeResult.learningLevel,
        strengths:
          safeResult.strengths,
        knowledgeGaps:
          safeResult.knowledgeGaps,
        recommendations:
          safeResult.recommendations,
        summary:
          safeResult.summary,
        nextAction:
          safeResult.nextAction,
      },
    );

    return {
      success: true,
      personalization: safeResult,
    };
  }

  static async get(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId: string | null | undefined,
  ) {
    const personalization =
      await AIPersonalizationRepository.get(
        studentId,
        courseId,
        organizationId,
        branchId,
      );

    if (!personalization) {
      return {
        success: true,
        personalization: null,
      };
    }

    const result: AIPersonalizationResult = {
      learningLevel:
        personalization.learningLevel === "BEGINNER" ||
        personalization.learningLevel === "DEVELOPING" ||
        personalization.learningLevel === "PROFICIENT" ||
        personalization.learningLevel === "ADVANCED"
          ? personalization.learningLevel
          : "BEGINNER",

      strengths: Array.isArray(personalization.strengths)
        ? personalization.strengths.filter(
            (item): item is {
              area: string;
              evidence: string;
            } =>
              typeof item === "object" &&
              item !== null &&
              "area" in item &&
              "evidence" in item &&
              typeof item.area === "string" &&
              typeof item.evidence === "string",
          )
        : [],

      knowledgeGaps: Array.isArray(
        personalization.knowledgeGaps,
      )
        ? personalization.knowledgeGaps.filter(
            (item): item is {
              area: string;
              evidence: string;
              severity: "LOW" | "MEDIUM" | "HIGH";
            } =>
              typeof item === "object" &&
              item !== null &&
              "area" in item &&
              "evidence" in item &&
              "severity" in item &&
              typeof item.area === "string" &&
              typeof item.evidence === "string" &&
              (item.severity === "LOW" ||
                item.severity === "MEDIUM" ||
                item.severity === "HIGH"),
          )
        : [],

      recommendations: Array.isArray(
        personalization.recommendations,
      )
        ? personalization.recommendations.filter(
            (item): item is {
              lessonId: string | null;
              lessonTitle: string;
              reason: string;
              priority: "LOW" | "MEDIUM" | "HIGH";
            } =>
              typeof item === "object" &&
              item !== null &&
              "lessonId" in item &&
              "lessonTitle" in item &&
              "reason" in item &&
              "priority" in item &&
              (typeof item.lessonId === "string" ||
                item.lessonId === null) &&
              typeof item.lessonTitle === "string" &&
              typeof item.reason === "string" &&
              (item.priority === "LOW" ||
                item.priority === "MEDIUM" ||
                item.priority === "HIGH"),
          )
        : [],

      summary:
        personalization.summary ??
        "Your personalized learning analysis is ready.",

      nextAction:
        personalization.nextAction ??
        "Continue completing your course lessons and assessments.",
    };

    return {
      success: true,
      personalization: result,
    };
  }
}
