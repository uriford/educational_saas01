import { gemini } from "@/lib/ai/gemini";

export interface ChatAIHistoryMessage {
  role: "user" | "model";
  content: string;
}

export interface GenerateChatAIResponseInput {
  message: string;
  history?: ChatAIHistoryMessage[];
}

export interface GenerateChatAIResponseResult {
  message: string;
  source: "gemini";
}

const CHAT_MODEL = "gemini-3.6-flash";

const SYSTEM_INSTRUCTION = `
You are the AI assistant for an educational organization.

Your job is to help students and users with:
- Courses and learning-related questions
- General educational questions
- Understanding the organization's services
- Basic academic guidance
- Questions about using the educational platform

Be helpful, clear, concise, and friendly.

Do not pretend to be a human staff member.
Do not claim to know organization-specific information unless that
information is provided in the conversation context.
Do not invent schedules, fees, teachers, policies, or other organization data.
If a question requires organization-specific information that you do not have,
tell the user that a staff member can help.

If a user clearly needs human assistance, encourage them to contact the
organization's support staff.

For academic questions, explain concepts clearly rather than simply giving
unsupported answers.
`.trim();

function buildPrompt(
  message: string,
  history: ChatAIHistoryMessage[] = [],
) {
  const recentHistory = history
    .slice(-12)
    .map((item) => {
      const role =
        item.role === "user"
          ? "User"
          : "Assistant";

      return `${role}: ${item.content}`;
    })
    .join("\n");

  return `
${SYSTEM_INSTRUCTION}

Conversation history:
${recentHistory || "(No previous conversation)"}

Current user message:
${message}

Assistant response:
`.trim();
}

export async function generateChatAIResponse(
  data: GenerateChatAIResponseInput,
): Promise<GenerateChatAIResponseResult> {
  const message = data.message.trim();

  if (!message) {
    throw new Error("Chat message is required.");
  }

  const prompt = buildPrompt(
    message,
    data.history ?? [],
  );

  try {
    const response = await gemini.interactions.create({
      model: CHAT_MODEL,
      input: prompt,
      store: false,
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty text response.",
      );
    }

    return {
      message: text.trim(),
      source: "gemini",
    };
  } catch (error) {
    console.error(
      "Gemini chat generation failed:",
      error,
    );

    throw new Error(
      "Unable to generate an AI response right now.",
    );
  }
}
