import {
  Headphones,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { auth } from "@/auth";

import StaffInbox from "@/features/chat/components/StaffInbox";

import {
  getChatInbox,
} from "@/features/chat/services/chat.service";

import {
  getChatStaffByUserId,
} from "@/features/chat/repository/chat.repository";

export default async function CommunicationPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }

  const isAdmin =
    session.user.role === "ORGANIZATION_ADMIN" ||
    session.user.role === "SUPER_ADMIN";

  /*
   * Always resolve the current user's ChatStaff record.
   *
   * Admins still retain organization-wide inbox access below,
   * but their own ChatStaff record must also be resolved so
   * StaffInbox can maintain the heartbeat that tells the
   * student chat system a human is actually available.
   */
  const currentStaff =
    await getChatStaffByUserId(
      session.user.organizationId,
      session.user.id,
    );

  /*
   * Non-admin users must have an explicit ChatStaff record.
   * Organization/Super admins may still access the inbox even
   * if their ChatStaff record does not exist.
   */
  if (!isAdmin && !currentStaff) {
    return null;
  }

  const conversations =
    await getChatInbox(
      session.user.organizationId,
      currentStaff?.id,
      currentStaff?.canViewAllChats ?? true,
    );

  const { getOrganizationChatStaff } =
    await import(
      "@/features/chat/repository/chat.repository"
    );

  const chatStaff =
    await getOrganizationChatStaff(
      session.user.organizationId,
    );

  const openCount =
    conversations.filter(
      (conversation) =>
        conversation.status === "OPEN",
    ).length;

  const waitingCount =
    conversations.filter(
      (conversation) =>
        conversation.status === "WAITING",
    ).length;

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
            <MessageCircle className="h-3.5 w-3.5" />

            Communication
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Communication Center
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Manage student conversations,
            support requests, and real-time
            communication from one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-medium">
              Live system
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <span className="text-xs font-medium">
              Secure
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Total conversations
            </p>

            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {conversations.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Open
            </p>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {openCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Waiting
            </p>

            <Headphones className="h-4 w-4 text-amber-500" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {waitingCount}
          </p>
        </div>
      </div>

      <StaffInbox
        conversations={conversations.map(
          (conversation) => ({
            id: conversation.id,
            status: conversation.status,
            student:
              conversation.student,
            assignedStaff:
              conversation.assignedStaff,
            messages:
              conversation.messages,
          }),
        )}
        chatStaff={chatStaff}
        currentUserId={
          session.user.id
        }
        currentUserRole={
          session.user.role
        }
        organizationId={
          session.user.organizationId
        }
      />
    </div>
  );
}
