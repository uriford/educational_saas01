"use client";

import {
  Search,
  MessageCircle,
  Clock3,
  CircleDot,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  messages?: {
    id: string;
    content: string;
    senderId: string | null;
    createdAt?: string | Date;
  }[];
}

interface Props {
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

type Filter = "ALL" | "OPEN" | "WAITING" | "CLOSED";

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
  if (!student) {
    return "U";
  }

  return `${student.firstName?.[0] ?? ""}${
    student.lastName?.[0] ?? ""
  }`.toUpperCase();
}

function formatConversationTime(
  value?: string | Date,
) {
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
        icon: CircleDot,
        className:
          "text-emerald-600 dark:text-emerald-400",
      };

    case "WAITING":
      return {
        label: "Waiting",
        icon: Clock3,
        className:
          "text-amber-600 dark:text-amber-400",
      };

    case "CLOSED":
      return {
        label: "Closed",
        icon: XCircle,
        className:
          "text-muted-foreground",
      };

    default:
      return {
        label: status,
        icon: CircleDot,
        className: "text-muted-foreground",
      };
  }
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
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
            conversation.messages?.[0]?.content
              ?.toLowerCase() ?? "";

          const matchesSearch =
            !query ||
            studentName.includes(query) ||
            latestMessage.includes(query);

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
        (item) => item.status === "OPEN",
      ).length,
      waiting: conversations.filter(
        (item) => item.status === "WAITING",
      ).length,
      closed: conversations.filter(
        (item) => item.status === "CLOSED",
      ).length,
    };
  }, [conversations]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b px-4 pb-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Conversations
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {counts.all} total conversations
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search conversations..."
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
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
            ([value, label, count]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(value)
                }
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition",
                  filter === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}

                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px]",
                    filter === value
                      ? "bg-primary-foreground/15"
                      : "bg-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredConversations.length ===
        0 ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium">
              No conversations found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="divide-y">
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

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      onSelect?.(
                        conversation.id,
                      )
                    }
                    className={cn(
                      "group relative flex w-full gap-3 px-4 py-3.5 text-left transition",
                      isSelected
                        ? "bg-primary/[0.07]"
                        : "hover:bg-muted/60",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                    )}

                    <Avatar className="h-11 w-11 shrink-0">
                      {conversation.student
                        ?.avatar && (
                        <AvatarImage
                          src={
                            conversation
                              .student
                              .avatar
                          }
                          alt={studentName}
                        />
                      )}

                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(
                          conversation.student,
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            isSelected &&
                              "text-primary",
                          )}
                        >
                          {studentName}
                        </p>

                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatConversationTime(
                            latestMessage?.createdAt,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {latestMessage?.content ??
                          "No messages yet"}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-medium",
                            status.className,
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />

                          {status.label}
                        </div>

                        {latestMessage &&
                          latestMessage.senderId !==
                            conversation
                              .student?.id && (
                            <Badge
                              variant="secondary"
                              className="h-5 rounded-md px-1.5 text-[9px]"
                            >
                              Staff replied
                            </Badge>
                          )}
                      </div>
                    </div>
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
