"use client";

import {
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  ImageIcon,
  MessageCircle,
  Paperclip,
  Search,
  UserRound,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  status: string;

  student?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatar?: string | null;
  } | null;

  assignedStaff?: {
    id: string;
    userId: string;
    position?: string | null;
    status?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
    user?: {
      id: string;
      firstName: string;
      lastName?: string | null;
      avatar?: string | null;
    } | null;
  } | null;

  messages?: {
    id: string;
    content: string;
    senderId: string | null;
    isAIResponse?: boolean;
    createdAt?: string | Date;
    attachments?: {
      id: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      publicUrl?: string;
    }[];
  }[];
}

type ConversationMessage =
  NonNullable<Conversation["messages"]>[number];

interface Props {
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

type Filter = "ALL" | "OPEN" | "WAITING" | "CLOSED";

function getStudentName(student?: Conversation["student"]) {
  if (!student) {
    return "Unknown student";
  }

  return [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(student?: Conversation["student"]) {
  if (!student) {
    return "U";
  }

  const initials = `${student.firstName?.[0] ?? ""}${
    student.lastName?.[0] ?? ""
  }`.toUpperCase();

  return initials || "U";
}

function getStaffName(
  staff?: Conversation["assignedStaff"],
) {
  if (!staff?.user) {
    return null;
  }

  return [staff.user.firstName, staff.user.lastName]
    .filter(Boolean)
    .join(" ");
}

function formatConversationTime(value?: string | Date) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const difference =
    now.getTime() - date.getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  if (
    difference >= oneDay &&
    difference < oneDay * 7
  ) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getStatusConfig(status: string) {
  switch (status) {
    case "OPEN":
      return {
        label: "Open",
        icon: CircleDotIcon,
        className:
          "text-emerald-600 dark:text-emerald-400",
        dotClassName:
          "bg-emerald-500",
      };

    case "WAITING":
      return {
        label: "Waiting",
        icon: Clock3,
        className:
          "text-amber-600 dark:text-amber-400",
        dotClassName:
          "bg-amber-500",
      };

    case "CLOSED":
      return {
        label: "Closed",
        icon: XCircle,
        className:
          "text-muted-foreground",
        dotClassName:
          "bg-muted-foreground/50",
      };

    default:
      return {
        label: status || "Unknown",
        icon: CircleDotIcon,
        className:
          "text-muted-foreground",
        dotClassName:
          "bg-muted-foreground/50",
      };
  }
}

function CircleDotIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        className,
      )}
    />
  );
}

function getAttachmentPreview(
  attachments?: ConversationMessage["attachments"],
) {
  if (!attachments?.length) {
    return null;
  }

  const first = attachments[0];

  if (first.mimeType.startsWith("image/")) {
    return {
      icon: ImageIcon,
      label:
        attachments.length > 1
          ? `${attachments.length} images`
          : "Image",
    };
  }

  if (first.mimeType.startsWith("video/")) {
    return {
      icon: Video,
      label:
        attachments.length > 1
          ? `${attachments.length} videos`
          : "Video",
    };
  }

  if (first.mimeType.startsWith("text/")) {
    return {
      icon: FileText,
      label:
        attachments.length > 1
          ? `${attachments.length} files`
          : first.fileName || "Document",
    };
  }

  return {
    icon: Paperclip,
    label:
      attachments.length > 1
        ? `${attachments.length} attachments`
        : first.fileName || "Attachment",
  };
}

function getMessagePreview(
  message?: ConversationMessage,
) {
  if (!message) {
    return {
      icon: null,
      text: "No messages yet",
      type: "none" as const,
    };
  }

  const attachment =
    getAttachmentPreview(message.attachments);

  if (attachment) {
    return {
      icon: attachment.icon,
      text: attachment.label,
      type: "attachment" as const,
    };
  }

  const content =
    message.content?.trim();

  if (!content) {
    return {
      icon: null,
      text: message.isAIResponse
        ? "AI response"
        : "Message",
      type: "message" as const,
    };
  }

  return {
    icon: null,
    text: content,
    type: "message" as const,
  };
}

function getSenderLabel(
  message?: ConversationMessage,
  student?: Conversation["student"],
) {
  if (!message) {
    return null;
  }

  if (message.isAIResponse) {
    return {
      label: "AI",
      icon: Bot,
    };
  }

  if (
    message.senderId &&
    student?.id &&
    message.senderId === student.id
  ) {
    return {
      label: "Student",
      icon: UserRound,
    };
  }

  return {
    label: "Staff",
    icon: Users,
  };
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const filteredConversations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return conversations.filter(
        (conversation) => {
          const studentName =
            getStudentName(
              conversation.student,
            ).toLowerCase();

          const latestMessage =
            conversation.messages?.[0];

          const messageContent =
            latestMessage?.content
              ?.toLowerCase() ?? "";

          const assignedStaff =
            getStaffName(
              conversation.assignedStaff,
            )?.toLowerCase() ?? "";

          const matchesSearch =
            !query ||
            studentName.includes(query) ||
            messageContent.includes(query) ||
            assignedStaff.includes(query);

          const matchesFilter =
            filter === "ALL" ||
            conversation.status === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      conversations,
      filter,
      search,
    ]);

  const counts = useMemo(() => {
    return {
      all: conversations.length,
      open: conversations.filter(
        (item) =>
          item.status === "OPEN",
      ).length,
      waiting: conversations.filter(
        (item) =>
          item.status === "WAITING",
      ).length,
      closed: conversations.filter(
        (item) =>
          item.status === "CLOSED",
      ).length,
    };
  }, [conversations]);

  const hasActiveSearch =
    search.trim().length > 0;

  function clearSearch() {
    setSearch("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="shrink-0 border-b px-3 pb-3 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
        <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold">
                Conversations
              </h2>

              <Badge
                variant="secondary"
                className="h-5 rounded-md px-1.5 text-[10px] font-medium"
              >
                {counts.all}
              </Badge>
            </div>

            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground sm:max-w-none">
              Manage student support conversations
            </p>
          </div>

          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-xl"
            aria-hidden="true"
          >
            <MessageCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="h-9 rounded-xl border-muted-foreground/20 bg-background pl-9 pr-9 text-sm shadow-none transition focus-visible:ring-2 sm:h-10"
          />

          {hasActiveSearch && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div
          className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none touch-pan-x"
          role="tablist"
          aria-label="Conversation filters"
        >
          {(
            [
              [
                "ALL",
                "All",
                counts.all,
              ],
              [
                "OPEN",
                "Open",
                counts.open,
              ],
              [
                "WAITING",
                "Waiting",
                counts.waiting,
              ],
              [
                "CLOSED",
                "Closed",
                counts.closed,
              ],
            ] as const
          ).map(
            ([value, label, count]) => {
              const active =
                filter === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    setFilter(value)
                  }
                  className={cn(
                    "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}

                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] leading-none",
                      active
                        ? "bg-primary-foreground/15"
                        : "bg-muted",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {filteredConversations.length ===
        0 ? (
          <div className="flex min-h-64 h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              {hasActiveSearch ? (
                <Search className="h-5 w-5 text-muted-foreground" />
              ) : (
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <p className="text-sm font-semibold">
              {hasActiveSearch
                ? "No matching conversations"
                : "No conversations yet"}
            </p>

            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {hasActiveSearch
                ? "Try a different name, message, staff member, or clear the search."
                : "Student conversations will appear here when they are created."}
            </p>

            {hasActiveSearch && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="mt-4 rounded-lg"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {filteredConversations.map(
              (conversation) => {
                const studentName =
                  getStudentName(
                    conversation.student,
                  );

                const latestMessage =
                  conversation.messages?.[0];

                const status =
                  getStatusConfig(
                    conversation.status,
                  );

                const StatusIcon =
                  status.icon;

                const isSelected =
                  selectedId ===
                  conversation.id;

                const messagePreview =
                  getMessagePreview(
                    latestMessage,
                  );

                const PreviewIcon =
                  messagePreview.icon;

                const sender =
                  getSenderLabel(
                    latestMessage,
                    conversation.student,
                  );

                const SenderIcon =
                  sender?.icon;

                const assignedStaff =
                  getStaffName(
                    conversation.assignedStaff,
                  );

                const isStaffAssigned =
                  Boolean(
                    conversation.assignedStaff,
                  );

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      onSelect?.(
                        conversation.id,
                      )
                    }
                    aria-current={
                      isSelected
                        ? "true"
                        : undefined
                    }
                    className={cn(
                      "group relative flex w-full gap-2.5 px-3 py-3 text-left outline-none transition sm:gap-3 sm:px-4 sm:py-3.5",
                      "focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30",
                      isSelected
                        ? "bg-primary/[0.07]"
                        : "hover:bg-muted/60",
                      conversation.status ===
                        "CLOSED" &&
                        !isSelected &&
                        "opacity-80",
                    )}
                  >
                    {isSelected && (
                      <span
                        className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-border/60 sm:h-11 sm:w-11">
                        {conversation.student
                          ?.avatar && (
                          <AvatarImage
                            src={
                              conversation
                                .student
                                .avatar
                            }
                            alt={
                              studentName
                            }
                          />
                        )}

                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            isSelected
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {getInitials(
                            conversation.student,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                          status.dotClassName,
                        )}
                        aria-label={
                          status.label
                        }
                        title={
                          status.label
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-1.5 sm:gap-2">
                        <p
                          className={cn(
                            "min-w-0 truncate text-[13px] font-semibold sm:text-sm",
                            isSelected &&
                              "text-primary",
                          )}
                        >
                          {studentName}
                        </p>

                        <span className="shrink-0 pt-0.5 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                          {formatConversationTime(
                            latestMessage?.createdAt,
                          )}
                        </span>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-1">
                        {PreviewIcon && (
                          <PreviewIcon
                            className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5"
                            aria-hidden="true"
                          />
                        )}

                        <p
                          className={cn(
                            "min-w-0 truncate text-xs",
                            latestMessage
                              ? "text-muted-foreground"
                              : "italic text-muted-foreground/70",
                          )}
                        >
                          {messagePreview.text}
                        </p>
                      </div>

                      <div className="mt-2 flex min-w-0 items-center gap-1 overflow-hidden sm:gap-1.5">
                        <div
                          className={cn(
                            "flex min-w-0 shrink items-center gap-0.5 text-[9px] font-medium sm:gap-1 sm:text-[10px]",
                            status.className,
                          )}
                        >
                          <StatusIcon
                            className="h-3 w-3"
                            aria-hidden="true"
                          />

                          <span>
                            {status.label}
                          </span>
                        </div>

                        {sender && (
                          <>
                            <span
                              className="text-muted-foreground/40"
                              aria-hidden="true"
                            >
                              •
                            </span>

                            <div className="flex min-w-0 shrink items-center gap-0.5 text-[9px] font-medium text-muted-foreground sm:gap-1 sm:text-[10px]">
                              {SenderIcon && (
                                <SenderIcon
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                              )}

                              <span className="truncate">
                                {sender.label}
                              </span>
                            </div>
                          </>
                        )}

                        {isStaffAssigned &&
                          assignedStaff && (
                            <>
                              <span
                                className="text-muted-foreground/40"
                                aria-hidden="true"
                              >
                                •
                              </span>

                              <span
                                className="min-w-0 truncate text-[9px] text-muted-foreground sm:text-[10px]"
                                title={`Assigned to ${assignedStaff}`}
                              >
                                {assignedStaff}
                              </span>
                            </>
                          )}
                      </div>

                      {latestMessage?.isAIResponse && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-violet-600 dark:text-violet-400 sm:mt-1.5 sm:text-[10px]">
                          <Bot
                            className="h-3 w-3"
                            aria-hidden="true"
                          />

                          <span>
                            AI-assisted response
                          </span>
                        </div>
                      )}
                    </div>

                    {conversation.status ===
                      "CLOSED" && (
                      <CheckCircle2
                        className="mt-0.5 hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 sm:block"
                        aria-label="Conversation closed"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
