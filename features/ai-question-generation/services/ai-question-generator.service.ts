import { gemini } from "@/lib/ai/gemini";

import type {
  AIGeneratedQuestionSet,
  AIQuestionType,
} from "../types/ai-question.types";

const AI_QUESTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: {
            type: "string",
          },
          type: {
            type: "string",
            enum: [
              "MCQ",
              "TRUE_FALSE",
              "SHORT_ANSWER",
              "LONG_ANSWER",
            ],
          },
          marks: {
            type: "number",
          },
          options: {
            type: "array",
            items: {
              type: "string",
            },
          },
          correctAnswer: {
            type: ["string", "null"],
          },
          explanation: {
            type: ["string", "null"],
          },
          sourceReference: {
            type: ["string", "null"],
          },
        },
        required: [
          "question",
          "type",
          "marks",
          "options",
          "correctAnswer",
          "explanation",
          "sourceReference",
        ],
      },
    },
  },
  required: ["questions"],
} as const;


async function callGeminiWithRetry(data: {
  prompt: string;
}) {

  const maxAttempts = 3;

  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    try {

      return await gemini.interactions.create({
        model: "gemini-3.6-flash",
        input: data.prompt,
        store: false,
        response_format: [
          {
            type: "text",
            mime_type: "application/json",
            schema: AI_QUESTION_SCHEMA,
          },
        ],
      });

    } catch (error) {

      lastError = error;

      console.error(
        `Gemini generation attempt ${attempt} failed`,
        error,
      );


      if (attempt < maxAttempts) {

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              attempt * 1000,
            ),
        );

      }

    }

  }


  throw new Error(
    "Gemini AI generation failed after multiple attempts.",
  );

}


export class AIQuestionGeneratorService {
  static async generate(data: {
    sourceText: string;
    questionCount: number;
    questionTypes: AIQuestionType[];
    difficulty?: string;
    instructions?: string;
  }): Promise<AIGeneratedQuestionSet> {
    if (!data.sourceText.trim()) {
      throw new Error("Source material is required.");
    }

    if (data.questionCount < 1) {
      throw new Error(
        "Question count must be greater than zero.",
      );
    }

    if (data.questionTypes.length === 0) {
      throw new Error(
        "At least one question type is required.",
      );
    }

    const difficulty =
      data.difficulty?.trim() || "medium";

    const instructions =
      data.instructions?.trim() ||
      "Create clear, academically appropriate assessment questions.";

    const prompt = `
You are an assessment-generation engine for a multi-tenant educational platform.

Your job is to generate assessment questions ONLY from the supplied source material.

SOURCE-GROUNDING RULES:
1. Do not use outside knowledge.
2. Do not invent facts that are not supported by the source.
3. Every question must be answerable from the supplied source.
4. Keep questions academically meaningful.
5. Avoid duplicate or near-duplicate questions.
6. Respect the requested question types.
7. Use the requested difficulty.
8. For MCQ questions, provide plausible distractors.
9. For TRUE_FALSE questions, provide exactly two answer choices:
   "True" and "False".
10. For SHORT_ANSWER and LONG_ANSWER questions, options must be an empty array.
11. correctAnswer must contain the expected answer for objectively gradable questions.
12. For SHORT_ANSWER and LONG_ANSWER, correctAnswer may contain a concise model answer.
13. Include a sourceReference whenever the source provides a recognizable section, heading, chapter, or page reference.
14. Never claim a source reference that is not present in the supplied material.
15. Return exactly the requested number of questions.

Requested difficulty:
${difficulty}

Requested question types:
${data.questionTypes.join(", ")}

Additional instructions:
${instructions}

Generate exactly ${data.questionCount} questions.

--- SOURCE MATERIAL START ---
${data.sourceText}
--- SOURCE MATERIAL END ---
    `.trim();

    const interaction =
      await callGeminiWithRetry({
        prompt,
      });

    const outputText = interaction.output_text;

    if (!outputText) {
      throw new Error(
        "AI returned an empty response.",
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new Error(
        "AI returned invalid structured data.",
      );
    }

    const result =
      parsed as AIGeneratedQuestionSet;

    if (
      !result.questions ||
      !Array.isArray(result.questions)
    ) {
      throw new Error(
        "AI response does not contain a valid question set.",
      );
    }

    if (
      result.questions.length !==
      data.questionCount
    ) {
      throw new Error(
        `AI returned ${result.questions.length} questions instead of ${data.questionCount}.`,
      );
    }

    return result;
  }
}
