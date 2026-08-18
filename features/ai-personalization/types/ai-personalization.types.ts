export type AIPersonalizationResult = {
  learningLevel:
    | "BEGINNER"
    | "DEVELOPING"
    | "PROFICIENT"
    | "ADVANCED";

  strengths: Array<{
    area: string;
    evidence: string;
  }>;

  knowledgeGaps: Array<{
    area: string;
    evidence: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  }>;

  recommendations: Array<{
    lessonId: string | null;
    lessonTitle: string;
    reason: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  }>;

  summary: string;

  nextAction: string;
};
