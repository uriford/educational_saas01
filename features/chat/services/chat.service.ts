import { getSupabaseServerClient } from "@/lib/supabase/server";

import { generateChatAIResponse } from "./gemini-chat.service";
import { publishChatMessage } from "../realtime/pusher.server";

import {
  findStudentConversation,
  createConversation,
  createMessage,
  createAIMessage,
  getOrganizationConversations,
  getConversationById,
  getStudentConversation,
  getGuardianStudentConversation,
  getOrganizationChatStaff,
  assignConversationStaff,
} from "../repository/chat.repository";

import {
  publishConversationAssignment,
} from "../realtime/pusher.server";

const PRESENCE_TIMEOUT_MS = 2 * 60 * 1000;

function isStaffCurrentlyActive(staff: {
  canReply: boolean;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  lastSeenAt: Date | null;
  lastActiveAt: Date | null;
}) {
  /*
   * Human availability is deliberately simple and deterministic.
   *
   * `lastSeenAt` is the heartbeat.
   * `lastActiveAt` is telemetry only.
   *
   * A staff member is considered human-available when:
   *   1. They are allowed to reply.
   *   2. Their explicit status is ONLINE.
   *   3. Their heartbeat is fresh.
   */
  if (!staff.canReply || staff.status !== "ONLINE") {
    return false;
  }

  if (!staff.lastSeenAt) {
    return false;
  }

  const age = Date.now() - staff.lastSeenAt.getTime();

  return age >= 0 && age <= PRESENCE_TIMEOUT_MS;
}

async function findBestAvailableStaff(
  organizationId: string,
) {
  const staff =
    await getOrganizationChatStaff(
      organizationId,
    );

  const eligible = staff.filter(
    isStaffCurrentlyActive,
  );

  if (!eligible.length) {
    return null;
  }

  const conversations =
    await getOrganizationConversations(
      organizationId,
    );

  const workload = new Map<string, number>();

  for (const member of eligible) {
    workload.set(member.id, 0);
  }

  for (const conversation of conversations) {
    if (
      conversation.assignedStaffId &&
      workload.has(
        conversation.assignedStaffId,
      ) &&
      conversation.status !== "CLOSED"
    ) {
      workload.set(
        conversation.assignedStaffId,
        (workload.get(
          conversation.assignedStaffId,
        ) ?? 0) + 1,
      );
    }
  }

  return [...eligible].sort(
    (a, b) =>
      (workload.get(a.id) ?? 0) -
      (workload.get(b.id) ?? 0),
  )[0] ?? null;
}

export async function startChatConversation(data: {
  organizationId: string;
  studentId: string;
}) {
  const existing =
    await findStudentConversation(
      data.organizationId,
      data.studentId,
    );

  if (existing) {
    return existing;
  }

  const conversation =
    await createConversation(data);

  try {
    const bestStaff =
      await findBestAvailableStaff(
        data.organizationId,
      );

    if (bestStaff) {
      const assignedConversation =
        await assignConversationStaff(
          conversation.id,
          data.organizationId,
          bestStaff.id,
        );

      try {
        await publishConversationAssignment(
          data.organizationId,
          conversation.id,
          {
            assignedStaffId: bestStaff.id,
          },
        );
      } catch (publishError) {
        console.error(
          "Failed to publish automatic conversation assignment:",
          publishError,
        );
      }

      return assignedConversation;
    }
  } catch (error) {
    console.error(
      "Automatic chat assignment failed:",
      error,
    );
  }

  return conversation;
}

const CHAT_ATTACHMENT_BUCKET = "chat-attachments";

const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",

  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

async function uploadChatAttachments(
  conversationId: string,
  files: File[],
) {
  if (!files.length) {
    return [];
  }

  const supabase = getSupabaseServerClient();

  const attachments = [];

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(
        `File "${file.name}" exceeds the 50 MB limit.`,
      );
    }

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      throw new Error(
        `File type "${file.type}" is not supported.`,
      );
    }

    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120);

    const storagePath =
      `${conversationId}/${crypto.randomUUID()}-${safeFileName}`;

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    const { error: uploadError } =
      await supabase.storage
        .from(CHAT_ATTACHMENT_BUCKET)
        .upload(storagePath, buffer, {
          contentType:
            file.type || "application/octet-stream",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(
        `Failed to upload "${file.name}": ${uploadError.message}`,
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(CHAT_ATTACHMENT_BUCKET)
      .getPublicUrl(storagePath);

    attachments.push({
      fileName: file.name,
      storagePath,
      publicUrl: publicUrlData.publicUrl,
      mimeType:
        file.type || "application/octet-stream",
      fileSize: file.size,
      width: null,
      height: null,
      duration: null,
    });
  }

  return attachments;
}

export async function sendChatMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  organizationId: string;
  files?: File[];
}) {
  const files = data.files ?? [];

  const attachments =
    await uploadChatAttachments(
      data.conversationId,
      files,
    );

  const message =
    await createMessage({
      conversationId:
        data.conversationId,
      senderId: data.senderId,
      content: data.content,
      organizationId:
        data.organizationId,
      attachments,
    });

  try {
    await publishChatMessage(
      data.organizationId,
      data.conversationId,
      message,
    );
  } catch (error) {
    console.error(
      "Failed to publish chat message through Pusher:",
      error,
    );
  }

  return message;
}

export async function sendAIChatMessage(data: {
  conversationId: string;
  content: string;
  organizationId: string;
}) {
  const message = await createAIMessage(data);

  try {
    await publishChatMessage(
      data.organizationId,
      data.conversationId,
      message,
    );
  } catch (error) {
    console.error(
      "Failed to publish AI chat message through Pusher:",
      error,
    );
  }

  return message;
}

export async function generateAIChatReply(data: {
  conversationId: string;
  organizationId: string;
  message: string;
}) {
  const conversation = await getConversationById(
    data.conversationId,
    data.organizationId,
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const history = conversation.messages
    .slice(-12)
    .map((message) => ({
      role: message.isAIResponse
        ? ("model" as const)
        : ("user" as const),
      content: message.content,
    }));

  const response = await generateChatAIResponse({
    message: data.message,
    history,
    organizationId: data.organizationId,
    studentId: conversation.studentId ?? undefined,
  });

  return sendAIChatMessage({
    conversationId: data.conversationId,
    organizationId: data.organizationId,
    content: response.message,
  });
}

export async function generateAndSaveAIChatResponse(data: {
  conversationId: string;
  organizationId: string;
  message: string;
}) {
  return generateAIChatReply(data);
}


export async function getChatInbox(
  organizationId: string,
  staffId?: string,
  canViewAllChats = false,
) {
  if (!staffId || canViewAllChats) {
    return getOrganizationConversations(
      organizationId,
    );
  }

  const conversations =
    await getOrganizationConversations(
      organizationId,
    );

  return conversations.filter(
    (conversation) =>
      conversation.assignedStaff?.id === staffId,
  );
}

export async function getChatConversation(
  conversationId: string,
  organizationId: string,
) {
  return getConversationById(
    conversationId,
    organizationId,
  );
}

export async function getStudentChatConversation(
  conversationId: string,
  organizationId: string,
  studentId: string,
) {
  return getStudentConversation(
    conversationId,
    organizationId,
    studentId,
  );
}



export async function getGuardianChatConversation(
  conversationId: string,
  organizationId: string,
  studentUserId: string,
) {
  return getGuardianStudentConversation(
    conversationId,
    organizationId,
    studentUserId,
  );
}

export async function getAvailableChatStaff(
  organizationId: string,
) {
  const staff =
    await getOrganizationChatStaff(
      organizationId,
    );

  const now = Date.now();

  return staff.filter((member) => {
    return isStaffCurrentlyActive(member);
  });
}

export async function shouldUseAIChatFallback(
  organizationId: string,
) {
  const availableStaff =
    await getAvailableChatStaff(organizationId);

  return availableStaff.length === 0;
}