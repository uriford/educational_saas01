export type AIQuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

export type AIGeneratedQuestion = {
  question: string;
  type: AIQuestionType;
  marks: number;
  options: string[];
  correctAnswer: string | null;
  explanation: string | null;
  sourceReference: string | null;
};

export type AIGeneratedQuestionSet = {
  questions: AIGeneratedQuestion[];
};
