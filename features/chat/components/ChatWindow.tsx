/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  X,
} from "lucide-react";

import MessageBubble from "./MessageBubble";

import {
  getPusherClient,
  getChatPrivateChannelName,
  getChatPresenceChannelName,
} from "../realtime/chat-realtime";

import {
  sendMessageAction,
  toggleMessageReactionAction,
  editMessageAction,
  deleteMessageAction,
} from "../actions/chat.actions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChatAttachment {
  id: string;
  fileName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string | Date;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string | null;
  senderName?: string | null;
  senderImage?: string | null;
  isAIResponse?: boolean;
  status?: "SENT" | "DELIVERED" | "SEEN";
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
  editedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  organizationId: string;
  messages: ChatMessage[];
}

function normalizeMessage(message: unknown): ChatMessage {
  console.log("========== CHAT AVATAR DEBUG ==========");
  console.log("RAW MESSAGE:", message);

  const raw =
    typeof message === "object" &&
    message !== null
      ? message as Record<string, unknown>
      : {};

  const nested = raw.message;

  const chatMessage =
    typeof nested === "object" &&
    nested !== null
      ? nested as Record<string, unknown>
      : raw;
  const senderDebug =
    typeof chatMessage.sender === "object" &&
    chatMessage.sender !== null
      ? chatMessage.sender as Record<string, unknown>
      : null;

  console.log("NORMALIZED SENDER:", chatMessage.sender ?? null);
  console.log(
    "NORMALIZED SENDER ID:",
    senderDebug?.id ?? null,
  );
  console.log(
    "NORMALIZED SENDER AVATAR:",
    senderDebug?.avatar ?? null,
  );

  const metadata =
    typeof chatMessage.metadata === "object" &&
    chatMessage.metadata !== null
      ? chatMessage.metadata as Record<string, unknown>
      : {};

  /**
   * Prisma messages now include the related User as `sender`.
   *
   * Realtime payloads may still provide senderName/senderImage
   * directly or through metadata, so normalization keeps all
   * existing compatibility paths.
   */
  const sender =
    typeof chatMessage.sender === "object" &&
    chatMessage.sender !== null
      ? chatMessage.sender as Record<string, unknown>
      : null;

  const id =
    typeof chatMessage.id === "string"
      ? chatMessage.id
      : typeof metadata.id === "string"
        ? metadata.id
        : typeof chatMessage.serial === "string"
          ? chatMessage.serial
          : crypto.randomUUID();

  const content =
    typeof chatMessage.content === "string"
      ? chatMessage.content
      : typeof chatMessage.text === "string"
        ? chatMessage.text
        : "";

  const senderId =
    typeof chatMessage.senderId === "string"
      ? chatMessage.senderId
      : typeof metadata.senderId === "string"
        ? metadata.senderId
        : typeof chatMessage.clientId === "string"
          ? chatMessage.clientId
          : sender && typeof sender.id === "string"
            ? sender.id
            : null;

  const senderName =
    typeof chatMessage.senderName === "string"
      ? chatMessage.senderName
      : sender
        ? [
            sender.firstName,
            sender.lastName,
          ]
            .filter(
              (value): value is string =>
                typeof value === "string" &&
                value.trim().length > 0,
            )
            .join(" ") || "User"
        : "User";

  const senderImage =
    typeof chatMessage.senderImage === "string"
      ? chatMessage.senderImage
      : sender && typeof sender.avatar === "string"
        ? sender.avatar
        : null;

  const isAIResponse =
    typeof chatMessage.isAIResponse === "boolean"
      ? chatMessage.isAIResponse
      : typeof metadata.isAIResponse === "boolean"
        ? metadata.isAIResponse
        : false;

  const possibleStatus =
    typeof chatMessage.status === "string"
      ? chatMessage.status
      : typeof metadata.status === "string"
        ? metadata.status
        : "SENT";

  const status: ChatMessage["status"] =
    possibleStatus === "DELIVERED" ||
    possibleStatus === "SEEN"
      ? possibleStatus
      : "SENT";

  const createdAt =
    typeof chatMessage.createdAt === "string"
      ? chatMessage.createdAt
      : typeof chatMessage.timestamp === "string"
        ? chatMessage.timestamp
        : new Date().toISOString();

  const editedAt =
    typeof chatMessage.editedAt === "string"
      ? chatMessage.editedAt
      : null;

  const deletedAt =
    typeof chatMessage.deletedAt === "string"
      ? chatMessage.deletedAt
      : null;

  const updatedAt =
    typeof chatMessage.updatedAt === "string"
      ? chatMessage.updatedAt
      : null;

  const reactions = Array.isArray(
    chatMessage.reactions,
  )
    ? chatMessage.reactions
        .filter(
          (reaction) =>
            typeof reaction === "object" &&
            reaction !== null,
        )
        .map((reaction) => {
          const item =
            reaction as Record<string, unknown>;

          return {
            id:
              typeof item.id === "string"
                ? item.id
                : crypto.randomUUID(),

            messageId:
              typeof item.messageId === "string"
                ? item.messageId
                : id,

            userId:
              typeof item.userId === "string"
                ? item.userId
                : "",

            emoji:
              typeof item.emoji === "string"
                ? item.emoji
                : "",

            createdAt:
              typeof item.createdAt === "string"
                ? item.createdAt
                : new Date().toISOString(),
          };
        })
        .filter(
          (reaction) =>
            reaction.userId &&
            reaction.emoji,
        )
    : [];

  const attachments = Array.isArray(
    chatMessage.attachments,
  )
    ? chatMessage.attachments
        .filter(
          (attachment) =>
            typeof attachment === "object" &&
            attachment !== null,
        )
        .map((attachment) => {
          const item =
            attachment as Record<string, unknown>;

          return {
            id:
              typeof item.id === "string"
                ? item.id
                : crypto.randomUUID(),

            fileName:
              typeof item.fileName === "string"
                ? item.fileName
                : "Attachment",

            storagePath:
              typeof item.storagePath === "string"
                ? item.storagePath
                : "",

            publicUrl:
              typeof item.publicUrl === "string"
                ? item.publicUrl
                : "",

            mimeType:
              typeof item.mimeType === "string"
                ? item.mimeType
                : "application/octet-stream",

            fileSize:
              typeof item.fileSize === "number"
                ? item.fileSize
                : 0,

            width:
              typeof item.width === "number"
                ? item.width
                : null,

            height:
              typeof item.height === "number"
                ? item.height
                : null,

            duration:
              typeof item.duration === "number"
                ? item.duration
                : null,
          };
        })
    : [];

  return {
    id,
    content,
    senderId,
    senderName,
    senderImage,
    isAIResponse,
    status,
    createdAt,
    updatedAt,
    editedAt,
    deletedAt,
    attachments,
    reactions,
  };
}





export default function ChatWindow({
  conversationId,
  currentUserId,
  organizationId,
  messages: initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const attachmentPreviewUrls = useMemo(() => {
    const urls = new Map<string, string>();

    for (const file of selectedFiles) {
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
      ) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        urls.set(key, URL.createObjectURL(file));
      }
    }

    return urls;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      for (const url of attachmentPreviewUrls.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, [attachmentPreviewUrls]);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const emojiPickerRef =
    useRef<HTMLDivElement>(null);

  type TypingUser = {
    id: string;
    name: string;
  };

  const [typingUsers, setTypingUsers] =
    useState<TypingUser[]>([]);

  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);

  /*
   * Presence members already contain the authenticated user's
   * Pusher presence information. We keep a lightweight lookup
   * here so typing indicators can display the real user's name.
   *
   * We intentionally do NOT store or render profile photos.
   */
  const presenceUserInfoRef = useRef<
    Map<
      string,
      {
        name: string;
        image: string | null;
      }
    >
  >(new Map());

  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, []);

  const insertEmoji = useCallback((emoji: string) => {
    setInput((previous) => `${previous}${emoji}`);
    setShowEmojiPicker(false);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!showEmojiPicker) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        emojiPickerRef.current?.contains(target)
      ) {
        return;
      }

      setShowEmojiPicker(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [showEmojiPicker]);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    const computedStyle =
      window.getComputedStyle(textarea);

    const lineHeight =
      Number.parseFloat(
        computedStyle.lineHeight,
      ) || 20;

    const minHeight =
      lineHeight + 16;

    const maxHeight = 128;

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight
        ? "auto"
        : "hidden";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  useEffect(() => {
    let cancelled = false;

    const pusher = getPusherClient();

    const privateChannelName =
      getChatPrivateChannelName(
        organizationId,
        conversationId,
      );

    const presenceChannelName =
      getChatPresenceChannelName(
        organizationId,
        conversationId,
      );

    console.log(
      "[ChatRealtime] Subscribing to:",
      privateChannelName,
    );

    console.log(
      "[ChatRealtime] Subscribing to presence:",
      presenceChannelName,
    );

    const channel =
      pusher.subscribe(
        privateChannelName,
      );

    const presenceChannel =
      pusher.subscribe(
        presenceChannelName,
      );

    channelRef.current = channel;
    presenceChannelRef.current =
      presenceChannel;

    channel.bind(
      "pusher:subscription_succeeded",
      () => {
        console.log(
          "[ChatRealtime] Private subscription succeeded:",
          privateChannelName,
        );
      },
    );

    channel.bind(
      "pusher:subscription_error",
      (error: unknown) => {
        console.error(
          "[ChatRealtime] Private subscription failed:",
          privateChannelName,
          error,
        );
      },
    );

    presenceChannel.bind(
      "pusher:subscription_succeeded",
      () => {
        console.log(
          "[ChatRealtime] Presence subscription succeeded:",
          presenceChannelName,
        );
      },
    );

    presenceChannel.bind(
      "pusher:subscription_error",
      (error: unknown) => {
        console.error(
          "[ChatRealtime] Presence subscription failed:",
          presenceChannelName,
          error,
        );
      },
    );

    const handleMessage = (
      payload: unknown,
    ) => {
      const incoming =
        normalizeMessage(payload);

      if (!incoming) {
        console.warn(
          "Ignoring invalid Pusher chat payload:",
          payload,
        );
        return;
      }

      setMessages((previous) => {
        const index =
          previous.findIndex(
            (message) =>
              message.id === incoming.id,
          );

        if (index === -1) {
          return [
            ...previous,
            incoming,
          ];
        }

        const next = [...previous];

        next[index] = {
          ...next[index],
          ...incoming,
        };

        return next;
      });

      /*
       * The message is already being rendered inside the
       * active conversation, so the read-state effect below
       * will mark it SEEN. Avoid firing DELIVERED and SEEN
       * simultaneously for the same message.
       */
      scrollToBottom();
    };

    const handleStatus = (
      payload: unknown,
    ) => {
      const statusPayload =
        typeof payload === "object" &&
        payload !== null
          ? payload as {
              messageId?: unknown;
              status?: unknown;
            }
          : {};

      if (
        typeof statusPayload.messageId !==
        "string"
      ) {
        return;
      }

      const nextStatus =
        statusPayload.status === "DELIVERED" ||
        statusPayload.status === "SEEN"
          ? statusPayload.status
          : undefined;

      setMessages((previous) =>
        previous.map((message) =>
          message.id ===
          statusPayload.messageId
            ? {
                ...message,
                status:
                  nextStatus ??
                  message.status,
              }
            : message,
        ),
      );
    };

    const handleMessageUpdated = (
      payload: unknown,
    ) => {
      const updatePayload =
        typeof payload === "object" &&
        payload !== null
          ? payload as {
              id?: unknown;
              content?: unknown;
              editedAt?: unknown;
              updatedAt?: unknown;
            }
          : {};

      if (
        typeof updatePayload.id !== "string" ||
        typeof updatePayload.content !== "string"
      ) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) =>
          message.id === updatePayload.id
            ? {
                ...message,
                content: updatePayload.content as string,
                editedAt:
                  typeof updatePayload.editedAt === "string"
                    ? updatePayload.editedAt
                    : null,
                updatedAt:
                  typeof updatePayload.updatedAt === "string"
                    ? updatePayload.updatedAt
                    : message.updatedAt,
              }
            : message,
        ),
      );
    };

    const handleMessageDeleted = (
      payload: unknown,
    ) => {
      const deletePayload =
        typeof payload === "object" &&
        payload !== null
          ? payload as {
              messageId?: unknown;
              deletedAt?: unknown;
            }
          : {};

      if (
        typeof deletePayload.messageId !== "string"
      ) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) =>
          message.id === deletePayload.messageId
            ? {
                ...message,
                content: "",
                editedAt: null,
                deletedAt:
                  typeof deletePayload.deletedAt === "string"
                    ? deletePayload.deletedAt
                    : new Date().toISOString(),
              }
            : message,
        ),
      );
    };

    const handleReaction = (
      payload: unknown,
    ) => {
      const reactionPayload =
        typeof payload === "object" &&
        payload !== null
          ? payload as {
              messageId?: unknown;
              reactions?: unknown;
            }
          : {};

      if (
        typeof reactionPayload.messageId !==
        "string" ||
        !Array.isArray(
          reactionPayload.reactions,
        )
      ) {
        return;
      }

      const normalizedReactions =
        reactionPayload.reactions
          .filter(
            (reaction) =>
              typeof reaction === "object" &&
              reaction !== null,
          )
          .map((reaction) => {
            const item =
              reaction as Record<string, unknown>;

            return {
              id:
                typeof item.id === "string"
                  ? item.id
                  : crypto.randomUUID(),

              messageId:
                typeof item.messageId === "string"
                  ? item.messageId
                  : reactionPayload.messageId as string,

              userId:
                typeof item.userId === "string"
                  ? item.userId
                  : "",

              emoji:
                typeof item.emoji === "string"
                  ? item.emoji
                  : "",

              createdAt:
                typeof item.createdAt === "string"
                  ? item.createdAt
                  : new Date().toISOString(),
            };
          })
          .filter(
            (reaction) =>
              reaction.userId &&
              reaction.emoji,
          );

      setMessages((previous) =>
        previous.map((message) =>
          message.id ===
          reactionPayload.messageId
            ? {
                ...message,
                reactions:
                  normalizedReactions,
              }
            : message,
        ),
      );
    };

    const handleTyping = (
      payload: unknown,
      metadata?: unknown,
    ) => {
      const payloadObject =
        typeof payload === "object" &&
        payload !== null
          ? payload as {
              typing?: unknown;
              name?: unknown;
              image?: unknown;
            }
          : {};

      const metadataObject =
        typeof metadata === "object" &&
        metadata !== null
          ? metadata as {
              user_id?: unknown;
              userId?: unknown;
              user_info?: unknown;
            }
          : {};

      const senderId =
        typeof metadataObject.user_id === "string"
          ? metadataObject.user_id
          : typeof metadataObject.userId === "string"
            ? metadataObject.userId
            : null;

      if (
        !senderId ||
        senderId === currentUserId
      ) {
        return;
      }

      const presenceInfo =
        presenceUserInfoRef.current.get(senderId);

      let senderName =
        presenceInfo?.name ?? null;

      let senderImage =
        presenceInfo?.image ?? null;

      if (
        !senderName &&
        typeof payloadObject.name === "string" &&
        payloadObject.name.trim()
      ) {
        senderName = payloadObject.name.trim();
      }

      if (
        !senderImage &&
        typeof payloadObject.image === "string" &&
        payloadObject.image.trim()
      ) {
        senderImage = payloadObject.image;
      }

      if (
        typeof metadataObject.user_info === "object" &&
        metadataObject.user_info !== null
      ) {
        const info =
          metadataObject.user_info as {
            name?: unknown;
            image?: unknown;
          };

        if (
          !senderName &&
          typeof info.name === "string" &&
          info.name.trim()
        ) {
          senderName = info.name.trim();
        }

        if (
          !senderImage &&
          typeof info.image === "string" &&
          info.image.trim()
        ) {
          senderImage = info.image;
        }
      }

      const displayName =
        senderName || "User";

      if (payloadObject.typing === true) {
        setTypingUsers((previous) => {
          const existing = previous.find(
            (user) => user.id === senderId,
          );

          if (existing) {
            return previous.map((user) =>
              user.id === senderId
                ? {
                    ...user,
                    name: displayName,
                    image: senderImage,
                  }
                : user,
            );
          }

          return [
            ...previous,
            {
              id: senderId,
              name: displayName,
              image: senderImage,
            },
          ];
        });
      } else {
        setTypingUsers((previous) =>
          previous.filter(
            (user) =>
              user.id !== senderId,
          ),
        );
      }
    };

    const handlePresenceSucceeded = (
      members: unknown,
    ) => {
      const users: string[] = [];

      presenceUserInfoRef.current.clear();

      if (
        typeof members !== "object" ||
        members === null ||
        !("each" in members) ||
        typeof members.each !== "function"
      ) {
        setOnlineUsers(users);
        return;
      }

      const presenceMembers =
        members as {
          each: (
            callback: (
              member: unknown,
            ) => void,
          ) => void;
        };

      presenceMembers.each(
        (member: unknown) => {
          const memberObject =
            typeof member === "object" &&
            member !== null
              ? member as {
                  id?: unknown;
                  info?: unknown;
                }
              : {};

          if (
            typeof memberObject.id !== "string"
          ) {
            return;
          }

          const info =
            typeof memberObject.info === "object" &&
            memberObject.info !== null
              ? memberObject.info as {
                  name?: unknown;
                  image?: unknown;
                }
              : {};

          const name =
            typeof info.name === "string" &&
            info.name.trim()
              ? info.name.trim()
              : "User";

          const image =
            typeof info.image === "string" &&
            info.image.trim()
              ? info.image
              : null;

          presenceUserInfoRef.current.set(
            memberObject.id,
            {
              name,
              image,
            },
          );

          if (
            memberObject.id !== currentUserId
          ) {
            users.push(memberObject.id);
          }
        },
      );

      setTypingUsers((previous) =>
        previous.map((user) => {
          const info =
            presenceUserInfoRef.current.get(user.id);

          return info
            ? {
                ...user,
                name: info.name,
                image: info.image,
              }
            : user;
        }),
      );

      setOnlineUsers(users);
    };

    const handleMemberAdded = (
      member: unknown,
    ) => {
      const memberObject =
        typeof member === "object" &&
        member !== null
          ? member as {
              id?: unknown;
              info?: unknown;
            }
          : {};

      if (
        typeof memberObject.id !== "string"
      ) {
        return;
      }

      const info =
        typeof memberObject.info === "object" &&
        memberObject.info !== null
          ? memberObject.info as {
              name?: unknown;
              image?: unknown;
            }
          : {};

      const name =
        typeof info.name === "string" &&
        info.name.trim()
          ? info.name.trim()
          : "User";

      const image =
        typeof info.image === "string" &&
        info.image.trim()
          ? info.image
          : null;

      presenceUserInfoRef.current.set(
        memberObject.id,
        {
          name,
          image,
        },
      );

      if (
        memberObject.id === currentUserId
      ) {
        return;
      }

      setOnlineUsers((previous) =>
        previous.includes(memberObject.id as string)
          ? previous
          : [
              ...previous,
              memberObject.id as string,
            ],
      );

      setTypingUsers((previous) =>
        previous.map((user) =>
          user.id === memberObject.id
            ? {
                ...user,
                name,
                image,
              }
            : user,
        ),
      );
    };

    const handleMemberRemoved = (
      member: unknown,
    ) => {
      const memberObject =
        typeof member === "object" &&
        member !== null
          ? member as {
              id?: unknown;
            }
          : {};

      if (
        typeof memberObject.id !==
        "string"
      ) {
        return;
      }

      setOnlineUsers((previous) =>
        previous.filter(
          (id) =>
            id !== memberObject.id,
        ),
      );

      presenceUserInfoRef.current.delete(
        memberObject.id,
      );

      setTypingUsers((previous) =>
        previous.filter(
          (user) =>
            user.id !== memberObject.id,
        ),
      );
    };

    const handleSubscriptionError = (
      error: unknown,
    ) => {
      console.error(
        "Pusher subscription error:",
        error,
      );
    };

    channel.bind(
      "chat-message-created",
      handleMessage,
    );

    channel.bind(
      "chat-message-status",
      handleStatus,
    );

    channel.bind(
      "chat-message-reaction",
      handleReaction,
    );

    channel.bind(
      "chat-message-updated",
      handleMessageUpdated,
    );

    channel.bind(
      "chat-message-deleted",
      handleMessageDeleted,
    );

    channel.bind(
      "pusher:subscription_error",
      handleSubscriptionError,
    );

    presenceChannel.bind(
      "client-typing",
      handleTyping,
    );

    presenceChannel.bind(
      "pusher:subscription_succeeded",
      handlePresenceSucceeded,
    );

    presenceChannel.bind(
      "pusher:member_added",
      handleMemberAdded,
    );

    presenceChannel.bind(
      "pusher:member_removed",
      handleMemberRemoved,
    );

    presenceChannel.bind(
      "pusher:subscription_error",
      handleSubscriptionError,
    );

    if (cancelled) {
      return;
    }

    return () => {
      cancelled = true;

      channel.unbind(
        "chat-message-created",
        handleMessage,
      );

      channel.unbind(
        "chat-message-status",
        handleStatus,
      );

      channel.unbind(
        "chat-message-reaction",
        handleReaction,
      );

      channel.unbind(
        "chat-message-updated",
        handleMessageUpdated,
      );

      channel.unbind(
        "chat-message-deleted",
        handleMessageDeleted,
      );

      channel.unbind(
        "pusher:subscription_error",
        handleSubscriptionError,
      );

      presenceChannel.unbind(
        "client-typing",
        handleTyping,
      );

      presenceChannel.unbind(
        "pusher:subscription_succeeded",
        handlePresenceSucceeded,
      );

      presenceChannel.unbind(
        "pusher:member_added",
        handleMemberAdded,
      );

      presenceChannel.unbind(
        "pusher:member_removed",
        handleMemberRemoved,
      );

      presenceChannel.unbind(
        "pusher:subscription_error",
        handleSubscriptionError,
      );

      pusher.unsubscribe(
        privateChannelName,
      );

      pusher.unsubscribe(
        presenceChannelName,
      );

      channelRef.current = null;
      presenceChannelRef.current =
        null;

      setTypingUsers([]);
      setOnlineUsers([]);
    };
  }, [
    conversationId,
    currentUserId,
    organizationId,
    scrollToBottom,
  ]);

  const handleToggleReaction = useCallback(
    async (
      messageId: string,
      emoji: string,
    ) => {
      const previousMessages = messages;

      setMessages((current) =>
        current.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          const reactions =
            message.reactions ?? [];

          const existingIndex =
            reactions.findIndex(
              (reaction) =>
                reaction.userId ===
                currentUserId,
            );

          if (existingIndex === -1) {
            return {
              ...message,
              reactions: [
                ...reactions,
                {
                  id:
                    `optimistic-${messageId}-${currentUserId}`,
                  messageId,
                  userId:
                    currentUserId,
                  emoji,
                  createdAt:
                    new Date().toISOString(),
                },
              ],
            };
          }

          const existing =
            reactions[existingIndex];

          if (existing.emoji === emoji) {
            return {
              ...message,
              reactions:
                reactions.filter(
                  (_, index) =>
                    index !==
                    existingIndex,
                ),
            };
          }

          const nextReactions =
            [...reactions];

          nextReactions[
            existingIndex
          ] = {
            ...existing,
            emoji,
          };

          return {
            ...message,
            reactions:
              nextReactions,
          };
        }),
      );

      try {
        const result =
          await toggleMessageReactionAction({
            conversationId,
            messageId,
            emoji,
          });

        if (
          !result.success ||
          !result.data
        ) {
          setMessages(
            previousMessages,
          );

          console.error(
            "Failed to update reaction:",
            result.error,
          );

          return;
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  reactions:
                    result.data
                      ?.reactions ?? [],
                }
              : message,
          ),
        );
      } catch (error) {
        setMessages(
          previousMessages,
        );

        console.error(
          "Toggle reaction error:",
          error,
        );
      }
    },
    [
      conversationId,
      currentUserId,
      messages,
    ],
  );

  const updateMessageStatus = useCallback(
    async (
      messageId: string,
      status: "DELIVERED" | "SEEN",
    ) => {
      try {
        await fetch(
          `/api/chat/conversations/${conversationId}/messages/${messageId}/status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          },
        );
      } catch (error) {
        console.error(
          `Failed to mark message ${status.toLowerCase()}:`,
          error,
        );
      }
    },
    [conversationId],
  );

  useEffect(() => {
    const incomingUnreadMessages =
      messages.filter(
        (message) =>
          message.senderId !== currentUserId &&
          message.status !== "SEEN",
      );

    if (!incomingUnreadMessages.length) {
      return;
    }

    for (const message of incomingUnreadMessages) {
      void updateMessageStatus(
        message.id,
        "SEEN",
      );
    }
  }, [
    messages,
    currentUserId,
    updateMessageStatus,
  ]);

  const handleTyping = useCallback(() => {
    const channel =
      presenceChannelRef.current;

    if (!channel) {
      return;
    }

    try {
      channel.trigger(
        "client-typing",
        {
          typing: true,
        },
      );
    } catch (error) {
      console.error(
        "Failed to publish typing event:",
        error,
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current,
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        try {
          channel.trigger(
            "client-typing",
            {
              typing: false,
            },
          );
        } catch (error) {
          console.error(
            "Failed to stop typing event:",
            error,
          );
        }
      }, 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    const maxFiles = 10;

    setSelectedFiles((previous) => {
      const existingKeys = new Set(
        previous.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );

      const nextFiles = [...previous];

      for (const file of files) {
        if (nextFiles.length >= maxFiles) {
          break;
        }

        if (file.size > maxSize) {
          continue;
        }

        const fileKey =
          `${file.name}-${file.size}-${file.lastModified}`;

        if (existingKeys.has(fileKey)) {
          continue;
        }

        existingKeys.add(fileKey);
        nextFiles.push(file);
      }

      return nextFiles;
    });

    event.target.value = "";
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  async function sendMessage() {
    const content = input.trim();

    if ((!content && !selectedFiles.length) || loading) {
      return;
    }

    setLoading(true);

    try {
      const result =
        await sendMessageAction({
          conversationId,
          senderId: currentUserId,
          content,
          files: selectedFiles,
        });

      if (!result.success || !result.data) {
        console.error(
          "Failed to send message:",
          result.error,
        );
        return;
      }

      const savedMessage =
        result.data.message;

      if (savedMessage) {
        const message =
          normalizeMessage(savedMessage);

        if (message) {
          setMessages((previous) => {
            const index =
              previous.findIndex(
                (item) =>
                  item.id === message.id,
              );

            if (index === -1) {
              return [
                ...previous,
                message,
              ];
            }

            const next = [...previous];

            next[index] = {
              ...next[index],
              ...message,
            };

            return next;
          });
        }
      }

      const aiMessage =
        result.data.aiMessage;

      if (aiMessage) {
        const normalizedAIMessage =
          normalizeMessage(aiMessage);

        if (normalizedAIMessage) {
          setMessages((previous) => {
            const index =
              previous.findIndex(
                (item) =>
                  item.id ===
                  normalizedAIMessage.id,
              );

            if (index === -1) {
              return [
                ...previous,
                normalizedAIMessage,
              ];
            }

            const next = [...previous];

            next[index] = {
              ...next[index],
              ...normalizedAIMessage,
            };

            return next;
          });
        }
      }

      setInput("");
      setSelectedFiles([]);
      setShowEmojiPicker(false);

      requestAnimationFrame(() => {
        scrollToBottom();
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  const handleEditMessage = useCallback(
    async (
      messageId: string,
      content: string,
    ) => {
      const result = await editMessageAction({
        conversationId,
        messageId,
        content,
      });

      if (!result.success || !result.data) {
        console.error(
          "Failed to edit message:",
          result.error,
        );
        return false;
      }

      const updated = result.data;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: updated.content,
                editedAt: updated.editedAt,
                updatedAt: updated.updatedAt,
              }
            : message,
        ),
      );

      return true;
    },
    [conversationId],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const result = await deleteMessageAction({
        conversationId,
        messageId,
      });

      if (!result.success || !result.data) {
        console.error(
          "Failed to delete message:",
          result.error,
        );
        return false;
      }

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: "",
                editedAt: null,
                deletedAt: result.data?.deletedAt ?? new Date().toISOString(),
              }
            : message,
        ),
      );

      return true;
    },
    [conversationId],
  );

  const otherUserOnline =
    onlineUsers.some(
      (id) => id !== currentUserId,
    );

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border shadow-sm">
      <div className="flex items-center justify-between border-b px-3 py-3 sm:px-5 sm:py-4">
        <div>
          <h2 className="font-semibold">
            American Council Support
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={
                otherUserOnline
                  ? "h-2 w-2 rounded-full bg-emerald-500"
                  : "h-2 w-2 rounded-full bg-muted-foreground/40"
              }
            />

            {typingUsers.length > 0
              ? typingUsers.length === 1
                ? `${typingUsers[0].name} is typing`
                : `${typingUsers.length} people are typing`
              : otherUserOnline
                ? "Online"
                : "Staff and AI assistance"}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Start a conversation
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isOwn={
                message.senderId ===
                currentUserId
              }
              editedAt={message.editedAt}
              deletedAt={message.deletedAt}
              isAI={message.isAIResponse}
              senderName={
                message.senderName ??
                undefined
              }
              senderImage={
                message.senderImage ??
                undefined
              }
              status={
                message.status
              }
              createdAt={
                message.createdAt
              }
              attachments={
                message.attachments
              }
              reactions={
                message.reactions
              }
              messageId={
                message.id
              }
              currentUserId={
                currentUserId
              }

              onToggleReaction={
                handleToggleReaction
              }
              onEditMessage={
                handleEditMessage
              }
              onDeleteMessage={
                handleDeleteMessage
              }
            />
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="mb-3 flex items-center gap-2 px-1 text-xs text-muted-foreground sm:mb-4 sm:px-0">
            <div className="flex gap-1 rounded-2xl bg-muted px-3 py-2">
              <span className="animate-bounce">
                •
              </span>
              <span className="animate-bounce [animation-delay:120ms]">
                •
              </span>
              <span className="animate-bounce [animation-delay:240ms]">
                •
              </span>
            </div>

            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing`
                : typingUsers.length === 2
                  ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing`
                  : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t bg-background/95 px-2.5 py-2.5 backdrop-blur sm:px-3 sm:py-3 md:px-5">
        <div className="relative">
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-14 left-0 z-20 w-64 rounded-2xl border bg-popover p-3 shadow-xl"
              >
                <div className="grid grid-cols-8 gap-1">
                  {[
                    "😀","😂","😊","😍","🥰","😎","🤔","😢",
                    "😭","😡","👍","👎","❤️","🔥","🎉","👏",
                    "🙏","✨","💯","😂","🤣","😅","😉","🤝",
                  ].map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              className="hidden"
              onChange={handleFileSelect}
            />

            {selectedFiles.length > 0 && (
              <div className="mb-2 rounded-2xl border bg-muted/30 p-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedFiles.map((file, index) => {
                    const fileKey =
                      `${file.name}-${file.size}-${file.lastModified}`;

                    const previewUrl =
                      attachmentPreviewUrls.get(fileKey);

                    const isImage =
                      file.type.startsWith("image/");

                    const isVideo =
                      file.type.startsWith("video/");

                    return (
                      <div
                        key={`${fileKey}-${index}`}
                        className="relative w-28 shrink-0 overflow-hidden rounded-xl border bg-background shadow-sm"
                      >
                        <div className="relative flex h-20 items-center justify-center overflow-hidden bg-muted">
                          {isImage && previewUrl ? (
                            // Local blob preview: next/image is not appropriate for
                            // browser-generated object URLs.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : isVideo && previewUrl ? (
                            <video
                              src={previewUrl}
                              muted
                              playsInline
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <File className="h-8 w-8 text-muted-foreground" />
                          )}

                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/90 shadow-sm"
                            onClick={() =>
                              removeSelectedFile(index)
                            }
                            disabled={loading}
                            title="Remove attachment"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="px-2 py-1.5">
                          <p
                            className="truncate text-[11px] font-medium"
                            title={file.name}
                          >
                            {file.name}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();

                if ((!input.trim() && !selectedFiles.length) || loading) return;

                void sendMessage();
              }}
              className="flex min-w-0 items-end gap-1.5 rounded-2xl border bg-muted/30 p-1.5 shadow-sm sm:gap-2 sm:p-2"
            >
              <div className="flex items-center gap-1 pb-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  title="Attach file"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  title="Add image"
                  disabled={loading}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept =
                        "image/*,video/*";
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  title="Emoji"
                  disabled={loading}
                  onClick={() =>
                    setShowEmojiPicker((previous) => !previous)
                  }
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  handleTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();

                    if (
                      (!input.trim() && selectedFiles.length === 0) ||
                      loading
                    ) {
                      return;
                    }

                    void sendMessage();
                  }
                }}
                placeholder="Type a message..."
                disabled={loading}
                rows={1}
                aria-label="Message"
                className="min-h-10 max-h-32 min-w-0 flex-1 resize-none overflow-y-hidden border-0 bg-transparent px-2 py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              />

              <Button
                type="submit"
                size="icon"
                disabled={
                  Boolean(loading) ||
                  (!input.trim() && selectedFiles.length === 0)
                }
                className="h-10 w-10 shrink-0 rounded-full"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

          <p className="mt-1.5 hidden px-2 text-[10px] text-muted-foreground sm:block">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </Card>
  );
}
