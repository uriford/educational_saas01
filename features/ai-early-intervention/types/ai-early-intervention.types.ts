export type AIRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type AIInterventionStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "DISMISSED";

export type AIRiskFactor = {
  factor: string;
  score: number;
  evidence: string;
};

export type AIRiskReason = {
  signal: string;
  evidence: string;
  severity: AIRiskLevel;
  contribution: number;
};

export type AIRecommendedAction = {
  action: string;
  reason: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export type AIEarlyInterventionAIAnalysis = {
  summary: string;
  primaryConcern: string;
  recommendedIntervention: string;
  urgency:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";
};

export type AIEarlyInterventionResult = {
  riskScore: number;
  riskLevel: AIRiskLevel;

  factors: AIRiskFactor[];

  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };

  learning: {
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    courseProgress: number;
    daysSinceActivity: number | null;
  };

  assessments: {
    total: number;
    averageScore: number;
    passed: number;
    failed: number;
    recentAverage: number;
    previousAverage: number;
    trend:
      | "IMPROVING"
      | "STABLE"
      | "DECLINING"
      | "INSUFFICIENT_DATA";
  };

  aiAnalysis: AIEarlyInterventionAIAnalysis;

  generatedAt: string;
};
