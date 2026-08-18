"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import ChatWindow from "@/features/chat/components/ChatWindow";
import { startGuardianConversationAction } from "@/features/chat/actions/chat.actions";
import { Button } from "@/components/ui/button";

type Child = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
};

type Conversation = {
  id: string;
  messages: Array<{
    id: string;
    content: string;
    senderId: string | null;
    isAIResponse: boolean;
    status: "SENT" | "DELIVERED" | "SEEN";
    createdAt: Date | string;
  }>;
};

type Props = {
  organizationId: string;
  guardianUserId: string;
  students: Child[];
  initialStudentId?: string;
  initialConversation: Conversation | null;
};

export default function GuardianMessages({
  organizationId,
  guardianUserId,
  students,
  initialStudentId,
  initialConversation,
}: Props) {
  const safeStudents = Array.isArray(students) ? students : [];

  const [selectedStudentId, setSelectedStudentId] =
    useState(initialStudentId ?? safeStudents[0]?.id ?? "");

  const [conversation, setConversation] =
    useState<Conversation | null>(initialConversation);

  const [loading, setLoading] = useState(false);

  async function startConversation() {
    if (!selectedStudentId) return;

    setLoading(true);

    try {
      const result =
        await startGuardianConversationAction({
          organizationId,
          studentId: selectedStudentId,
        });

      if (!result.success || !result.data) {
        window.alert(
          result.error ?? "Failed to start conversation",
        );
        return;
      }

      setConversation(result.data as Conversation);
    } finally {
      setLoading(false);
    }
  }

  function handleChildChange(value: string) {
    setSelectedStudentId(value);

    if (value !== initialStudentId) {
      setConversation(null);
    }
  }

  const selectedChild = safeStudents.find(
    (child) => child.id === selectedStudentId,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Contact American Council staff about your student.
        </p>
      </div>

      {safeStudents.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="font-semibold">
            No students linked
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not currently have any students linked to
            your guardian account.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="guardian-student"
                className="mb-2 block text-sm font-medium"
              >
                Student
              </label>

              <select
                id="guardian-student"
                value={selectedStudentId}
                onChange={(event) =>
                  handleChildChange(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {safeStudents.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName}{" "}
                    {child.lastName ?? ""}
                  </option>
                ))}
              </select>
            </div>

            {!conversation && (
              <Button
                type="button"
                onClick={startConversation}
                disabled={loading || !selectedStudentId}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading
                  ? "Starting..."
                  : "Start conversation"}
              </Button>
            )}
          </div>

          {conversation ? (
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-semibold">
                  Conversation about{" "}
                  {selectedChild?.firstName}{" "}
                  {selectedChild?.lastName ?? ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Staff will respond when available. If no
                  eligible staff member is online, the AI
                  assistant will respond.
                </p>
              </div>

              <div className="h-[600px]">
                <ChatWindow
                  conversationId={conversation.id}
                  currentUserId={guardianUserId}
                  organizationId={organizationId}
                  messages={conversation.messages}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-background p-10 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h2 className="font-semibold">
                No conversation yet
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start a conversation to contact staff about{" "}
                {selectedChild?.firstName ?? "your student"}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
