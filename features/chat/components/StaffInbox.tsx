/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  Info,
  MessageCircle,
  PanelRight,
  UserRound,
  UserPlus,
  X,
} from "lucide-react";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  assignConversationAction,
  claimConversationAction,
  unassignConversationAction,
} from "../actions/staff-assignment.actions";

import { getPusherClient } from "../realtime/chat-realtime";

interface ChatStaff {
  id: string;
  userId: string;
  position?: string | null;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  lastSeenAt?: string | Date | null;
  lastActiveAt?: string | Date | null;
  canReply: boolean;
  canViewAllChats: boolean;
  user: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatar?: string | null;
  };
}

interface Conversation {
  id: string;
  status: string;
  assignedStaff?: {
    id: string;
    userId: string;
    position?: string | null;
    status: "ONLINE" | "OFFLINE" | "BUSY";
    canReply: boolean;
    canViewAllChats?: boolean;
    user: {
      id: string;
      firstName: string;
      lastName?: string | null;
      avatar?: string | null;
    };
  } | null;
  student?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatar?: string | null;
  } | null;
  messages?: {
    id: string;
    content: string;
    senderId: string | null;
    createdAt?: string | Date;
  }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  isAIResponse?: boolean;
  status?: "SENT" | "DELIVERED" | "SEEN";
  createdAt?: string | Date;
}

interface StaffInboxProps {
  conversations: Conversation[];
  chatStaff: ChatStaff[];
  currentUserId: string;
  currentUserRole: string;
  organizationId: string;
}

function getStudentName(
  student?: Conversation["student"],
) {
  if (!student) {
    return "Unknown student";
  }

  return [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(
  student?: Conversation["student"],
) {
  if (!student) return "U";

  return `${student.firstName?.[0] ?? ""}${
    student.lastName?.[0] ?? ""
  }`.toUpperCase();
}

function sessionUserCanManageAssignments(
  currentUserRole: string,
) {
  return (
    currentUserRole === "ORGANIZATION_ADMIN" ||
    currentUserRole === "SUPER_ADMIN"
  );
}

export default function StaffInbox({
  conversations,
  chatStaff,
  currentUserId,
  currentUserRole,
  organizationId,
}: StaffInboxProps) {
  const [selected, setSelected] =
    useState<string | null>(
      conversations[0]?.id ?? null,
    );

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [liveChatStaff, setLiveChatStaff] =
    useState<ChatStaff[]>(chatStaff);

  const liveChatStaffRef =
    useRef<ChatStaff[]>(chatStaff);

  const [loading, setLoading] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(true);

  const [assignmentState, setAssignmentState] =
    useState<
      Record<
        string,
        Conversation["assignedStaff"]
      >
    >(
      Object.fromEntries(
        conversations.map((conversation) => [
          conversation.id,
          conversation.assignedStaff ?? null,
        ]),
      ),
    );

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState<string | null>(null);

  const selectedConversation =
    useMemo(
      () =>
        conversations.find(
          (conversation) =>
            conversation.id === selected,
        ),
      [conversations, selected],
    );

  useEffect(() => {
    liveChatStaffRef.current = liveChatStaff;
  }, [liveChatStaff]);
  useEffect(() => {
    if (
      selected &&
      !conversations.some(
        (conversation) =>
          conversation.id === selected,
      )
    ) {
      setSelected(
        conversations[0]?.id ?? null,
      );
    }
  }, [conversations, selected]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    async function loadConversation() {
      setLoading(true);

      try {
        const response =
          await fetch(
            `/api/chat/conversations/${selected}`,
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load conversation",
          );
        }

        const data =
          await response.json();

        setMessages(
          data.messages ?? [],
        );
      } catch (error) {
        console.error(
          "Failed to load chat conversation:",
          error,
        );

        setMessages([]);
      } finally {
        setLoading(false);
      }
    }

    void loadConversation();
  }, [selected]);

  const studentName =
    getStudentName(
      selectedConversation?.student,
    );

  const assignedStaff =
    selected
      ? assignmentState[selected] ??
        selectedConversation?.assignedStaff ??
        null
      : null;

  const currentStaff = liveChatStaff.find(
    (member) =>
      member.userId === currentUserId,
  );

  const currentStaffId = currentStaff?.id ?? null;

  useEffect(() => {
    if (!currentStaffId) {
      return;
    }

    let mounted = true;
    let lastInteractionAt = Date.now();
    let heartbeatTimer: ReturnType<
      typeof setInterval
    > | null = null;

    const markActivity = () => {
      lastInteractionAt = Date.now();
    };

    const sendPresence = async (
      status: "ONLINE" | "OFFLINE",
    ) => {
      try {
        const active =
          Date.now() -
            lastInteractionAt <=
          2 * 60 * 1000;

        await fetch(
          "/api/chat/staff/presence",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
              active,
              lastActiveAt:
                new Date(
                  lastInteractionAt,
                ).toISOString(),
            }),
            keepalive:
              status === "OFFLINE",
          },
        );
      } catch (error) {
        console.error(
          "Failed to update chat staff presence:",
          error,
        );
      }
    };

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        markActivity();
        void sendPresence("ONLINE");
      }
    };

    const interactionEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ] as const;

    for (const eventName of interactionEvents) {
      window.addEventListener(
        eventName,
        markActivity,
        { passive: true },
      );
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    markActivity();
    void sendPresence("ONLINE");

    heartbeatTimer = setInterval(() => {
      if (!mounted) {
        return;
      }

      if (
        document.visibilityState !==
        "visible"
      ) {
        return;
      }

      void sendPresence("ONLINE");
    }, 30 * 1000);

    const handleBeforeUnload = () => {
      if (!mounted) {
        return;
      }

      mounted = false;

      const payload =
        JSON.stringify({
          status: "OFFLINE",
          active: false,
        });

      try {
        navigator.sendBeacon(
          "/api/chat/staff/presence",
          new Blob(
            [payload],
            {
              type: "application/json",
            },
          ),
        );
      } catch {
        // Best effort only during unload.
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      mounted = false;

      if (heartbeatTimer) {
        clearInterval(
          heartbeatTimer,
        );
      }

      for (const eventName of interactionEvents) {
        window.removeEventListener(
          eventName,
          markActivity,
        );
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );

      void sendPresence("OFFLINE");
    };
  }, [currentStaffId, currentUserId]);

  const [currentTime, setCurrentTime] =
    useState(() => Date.now());

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          Date.now(),
        );
      }, 30 * 1000);

    return () =>
      clearInterval(timer);
  }, []);

  function getStaffActivityState(
    member: Pick<
      ChatStaff,
      | "canReply"
      | "status"
      | "lastSeenAt"
      | "lastActiveAt"
    >,
  ) {
    if (member.status === "BUSY") {
      return "BUSY";
    }

    if (
      !member.lastSeenAt
    ) {
      return "OFFLINE";
    }

    const now = currentTime;

    const lastSeen =
      new Date(
        member.lastSeenAt,
      ).getTime();

    const lastActive =
      member.lastActiveAt
        ? new Date(
            member.lastActiveAt,
          ).getTime()
        : 0;

    if (
      now - lastSeen >
      90 * 1000
    ) {
      return "OFFLINE";
    }

    if (
      now - lastActive <=
      2 * 60 * 1000
    ) {
      return "ACTIVE";
    }

    return "AWAY";
  }

  const availableStaff =
    liveChatStaff.filter(
      (member) =>
        member.canReply &&
        getStaffActivityState(member) ===
          "ACTIVE",
    );

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const pusher = getPusherClient();
    const channelName =
      `private-staff-${organizationId}`;

    const channel =
      pusher.subscribe(channelName);

    const handleAssignment = (event: {
      conversationId: string;
      assignedStaffId: string | null;
    }) => {
      if (!event?.conversationId) {
        return;
      }

      const assignedStaff =
        event.assignedStaffId
          ? liveChatStaffRef.current.find(
              (member) =>
                member.id ===
                event.assignedStaffId,
            ) ?? null
          : null;

      setAssignmentState((previous) => ({
        ...previous,
        [event.conversationId]:
          assignedStaff,
      }));
    };

    const handlePresence = (event: {
      staffId: string;
      status:
        | "ONLINE"
        | "OFFLINE"
        | "BUSY";
      activityState:
        | "ACTIVE"
        | "AWAY"
        | "OFFLINE"
        | "BUSY";
      lastSeenAt?: string | null;
      lastActiveAt?: string | null;
    }) => {
      if (!event?.staffId) {
        return;
      }

      setLiveChatStaff((previous) =>
        previous.map((member) => {
          if (member.id !== event.staffId) {
            return member;
          }

          return {
            ...member,
            status: event.status,
            lastSeenAt:
              event.lastSeenAt ??
              member.lastSeenAt ??
              null,
            lastActiveAt:
              event.lastActiveAt ??
              member.lastActiveAt ??
              null,
          };
        }),
      );
    };

    channel.bind(
      "conversation-assignment-updated",
      handleAssignment,
    );

    channel.bind(
      "staff-presence-updated",
      handlePresence,
    );

    return () => {
      channel.unbind(
        "conversation-assignment-updated",
        handleAssignment,
      );

      channel.unbind(
        "staff-presence-updated",
        handlePresence,
      );

      pusher.unsubscribe(channelName);
    };
  }, [organizationId]);

  async function handleClaim() {
    if (!selected) return;

    setAssignmentLoading(true);
    setAssignmentMessage(null);

    const result =
      await claimConversationAction(selected);

    if (result.success) {
      const updated =
        result.data?.assignedStaffId
        ? liveChatStaff.find(
            (member) =>
              member.id === result.data?.assignedStaffId,
          ) ?? null
        : null;

      setAssignmentState((previous) => ({
        ...previous,
        [selected]: updated,
      }));

      setAssignmentMessage(
        result.message,
      );
    } else {
      setAssignmentMessage(
        result.message,
      );
    }

    setAssignmentLoading(false);
  }

  async function handleAssign(
    staffId: string,
  ) {
    if (!selected || !staffId) return;

    setAssignmentLoading(true);
    setAssignmentMessage(null);

    const result =
      await assignConversationAction({
        conversationId: selected,
        staffId,
      });

    if (result.success) {
      const updated =
        result.data?.assignedStaffId
        ? liveChatStaff.find(
            (member) =>
              member.id === result.data?.assignedStaffId,
          ) ?? null
        : null;

      setAssignmentState((previous) => ({
        ...previous,
        [selected]: updated,
      }));

      setAssignmentMessage(
        result.message,
      );
    } else {
      setAssignmentMessage(
        result.message,
      );
    }

    setAssignmentLoading(false);
  }

  async function handleUnassign() {
    if (!selected) return;

    setAssignmentLoading(true);
    setAssignmentMessage(null);

    const result =
      await unassignConversationAction(
        selected,
      );

    if (result.success) {
      setAssignmentState((previous) => ({
        ...previous,
        [selected]: null,
      }));

      setAssignmentMessage(
        result.message,
      );
    } else {
      setAssignmentMessage(
        result.message,
      );
    }

    setAssignmentLoading(false);
  }

  return (
    <Card className="h-[calc(100vh-220px)] min-h-[620px] overflow-hidden shadow-sm">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        {/* Conversation sidebar */}
        <div className="hidden min-h-0 border-r lg:block">
          <ConversationList
            conversations={conversations}
            selectedId={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Main conversation */}
        <div className="min-h-0 min-w-0">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="h-7 w-7" />
              </div>

              <h2 className="text-lg font-semibold">
                Your conversations
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Select a student conversation
                to start chatting and manage
                support requests.
              </p>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading conversation...
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              {/* Mobile / tablet conversation selector */}
              <div className="flex items-center gap-2 border-b p-3 lg:hidden">
                <div className="min-w-0 flex-1">
                  <select
                    value={selected}
                    onChange={(event) =>
                      setSelected(
                        event.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none"
                  >
                    {conversations.map(
                      (conversation) => (
                        <option
                          key={
                            conversation.id
                          }
                          value={
                            conversation.id
                          }
                        >
                          {getStudentName(
                            conversation.student,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setShowDetails(
                      (value) =>
                        !value,
                    )
                  }
                  className="shrink-0"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="min-h-0 flex-1">
                <ChatWindow
                  organizationId={
                    organizationId
                  }
                  conversationId={
                    selected
                  }
                  currentUserId={
                    currentUserId
                  }
                  messages={messages}
                />
              </div>
            </div>
          )}
        </div>

        {/* Details panel */}
        <aside
          className={cn(
            "hidden min-h-0 border-l bg-muted/[0.18] xl:block",
            !showDetails &&
              "xl:hidden",
          )}
        >
          {selectedConversation ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Conversation details
                  </h3>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Student information
                  </p>
                </div>

                <Info className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20">
                    {selectedConversation
                      .student?.avatar && (
                      <AvatarImage
                        src={
                          selectedConversation
                            .student
                            .avatar
                        }
                        alt={studentName}
                      />
                    )}

                    <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                      {getInitials(
                        selectedConversation.student,
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <h4 className="mt-3 font-semibold">
                    {studentName}
                  </h4>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Student
                  </div>
                </div>

                <div className="my-6 h-px bg-border" />

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Conversation
                    </p>

                    <div className="mt-2 rounded-xl border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>

                        <span className="text-xs font-medium">
                          {
                            selectedConversation.status
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Assigned staff
                    </p>

                    <div className="mt-2 rounded-xl border bg-background p-3">
                      {assignedStaff ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {assignedStaff.user.firstName?.[0] ?? "S"}
                              {assignedStaff.user.lastName?.[0] ?? ""}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {[
                                  assignedStaff.user.firstName,
                                  assignedStaff.user.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </p>

                              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    getStaffActivityState(
                                      assignedStaff,
                                    ) === "ACTIVE"
                                      ? "bg-emerald-500"
                                      : getStaffActivityState(
                                          assignedStaff,
                                        ) === "AWAY"
                                        ? "bg-amber-500"
                                        : "bg-muted-foreground",
                                  )}
                                />

                                {getStaffActivityState(
                                  assignedStaff,
                                )}
                              </div>
                            </div>
                          </div>

                          {sessionUserCanManageAssignments(
                            currentUserRole,
                          ) && (
                            <div className="space-y-2">
                              <select
                                value={assignedStaff.id}
                                disabled={
                                  assignmentLoading
                                }
                                onChange={(event) =>
                                  void handleAssign(
                                    event.target.value,
                                  )
                                }
                                className="h-9 w-full rounded-lg border bg-background px-2 text-xs outline-none"
                              >
                                {availableStaff.map(
                                  (member) => (
                                    <option
                                      key={member.id}
                                      value={member.id}
                                    >
                                      {[
                                        member.user
                                          .firstName,
                                        member.user
                                          .lastName,
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    </option>
                                  ),
                                )}
                              </select>

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={
                                  assignmentLoading
                                }
                                onClick={() =>
                                  void handleUnassign()
                                }
                              >
                                <X className="mr-2 h-3.5 w-3.5" />
                                Unassign
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            No staff member is assigned.
                          </p>

                          {currentStaff?.canReply &&
                            getStaffActivityState(
                              currentStaff,
                            ) === "ACTIVE" && (
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={
                                  assignmentLoading
                                }
                                onClick={() =>
                                  void handleClaim()
                                }
                              >
                                <UserPlus className="mr-2 h-3.5 w-3.5" />
                                Claim conversation
                              </Button>
                            )}

                          {sessionUserCanManageAssignments(
                            currentUserRole,
                          ) &&
                            availableStaff.length > 0 && (
                              <select
                                disabled={
                                  assignmentLoading
                                }
                                defaultValue=""
                                onChange={(event) => {
                                  if (
                                    event.target.value
                                  ) {
                                    void handleAssign(
                                      event.target.value,
                                    );
                                  }
                                }}
                                className="h-9 w-full rounded-lg border bg-background px-2 text-xs outline-none"
                              >
                                <option value="">
                                  Assign to staff...
                                </option>

                                {availableStaff.map(
                                  (member) => (
                                    <option
                                      key={member.id}
                                      value={member.id}
                                    >
                                      {[
                                        member.user
                                          .firstName,
                                        member.user
                                          .lastName,
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    </option>
                                  ),
                                )}
                              </select>
                            )}
                        </div>
                      )}

                      {assignmentMessage && (
                        <div className="flex items-center gap-1.5 border-t pt-2 text-[10px] text-muted-foreground">
                          <Check className="h-3 w-3" />
                          {assignmentMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Student
                    </p>

                    <div className="mt-2 space-y-2 rounded-xl border bg-background p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <UserRound className="h-3.5 w-3.5 text-muted-foreground" />

                        <span className="truncate">
                          {studentName}
                        </span>
                      </div>

                      <p className="break-all text-[11px] text-muted-foreground">
                        ID:{" "}
                        {
                          selectedConversation
                            .student?.id
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
              Select a conversation to
              view details.
            </div>
          )}
        </aside>
      </div>
    </Card>
  );
}
