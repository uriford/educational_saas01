import { z } from "zod";

export const aiPersonalizationSchema = z.object({
  learningLevel: z.enum([
    "BEGINNER",
    "DEVELOPING",
    "PROFICIENT",
    "ADVANCED",
  ]),

  strengths: z.array(
    z.object({
      area: z.string().min(1),
      evidence: z.string().min(1),
    }),
  ),

  knowledgeGaps: z.array(
    z.object({
      area: z.string().min(1),
      evidence: z.string().min(1),
      severity: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
      ]),
    }),
  ),

  recommendations: z.array(
    z.object({
      lessonId: z.string().nullable(),
      lessonTitle: z.string().min(1),
      reason: z.string().min(1),
      priority: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
      ]),
    }),
  ),

  summary: z.string().min(1),

  nextAction: z.string().min(1),
});
