"use client";

import Image from "next/image";


import {
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  CheckCheck,
  FileText,
  Download,
  User,
  X,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  File,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Smile,
  MoreVertical,
  Pencil,
  Trash2,
  Check as CheckIcon,
} from "lucide-react";

import {
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

interface Attachment {
  id: string;
  fileName: string;
  publicUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string | Date;
}

const REACTION_EMOJIS = [
  "❤️",
  "👍",
  "😂",
  "😮",
  "😢",
  "😡",
  "👏",
  "🙏",
];

interface MessageBubbleProps {
  messageId: string;
  content: string;
  isOwn?: boolean;
  isAI?: boolean;
  senderName?: string;
  senderImage?: string | null;
  status?: "SENT" | "DELIVERED" | "SEEN";
  createdAt?: string | Date;
  editedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  attachments?: Attachment[];
  reactions?: Reaction[];
  currentUserId: string;
  onToggleReaction: (
    messageId: string,
    emoji: string,
  ) => void;
  onEditMessage: (
    messageId: string,
    content: string,
  ) => Promise<boolean>;
  onDeleteMessage: (
    messageId: string,
  ) => Promise<boolean>;
}

function formatTime(value?: string | Date) {
  if (!value) return "Just now";

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatVideoDuration(
  duration?: number | null,
) {
  if (
    duration === null ||
    duration === undefined ||
    !Number.isFinite(duration) ||
    duration < 0
  ) {
    return null;
  }

  const totalSeconds = Math.floor(duration);

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  return `${minutes}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}


function MessageStatus({
  status,
}: {
  status?: "SENT" | "DELIVERED" | "SEEN";
}) {
  if (status === "SEEN") {
    return (
      <CheckCheck className="h-3.5 w-3.5" />
    );
  }

  if (status === "DELIVERED") {
    return (
      <CheckCheck className="h-3.5 w-3.5" />
    );
  }

  return (
    <Check className="h-3.5 w-3.5" />
  );
}

function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
}: {
  images: Attachment[];
  activeIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const activeImage = images[activeIndex];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onPrevious();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow = "";
    };
  }, [
    onClose,
    onPrevious,
    onNext,
  ]);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close image viewer"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className="relative flex max-h-full max-w-full flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex max-h-[82vh] max-w-[92vw] items-center justify-center">
          <Image
            src={activeImage.publicUrl}
            alt={activeImage.fileName}
            width={activeImage.width || 1600}
            height={activeImage.height || 1200}
            unoptimized
            className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain"
          />
        </div>

        <div className="flex max-w-[92vw] items-center gap-3 text-sm text-white/80">
          <span className="max-w-[60vw] truncate">
            {activeImage.fileName}
          </span>

          {images.length > 1 && (
            <span className="shrink-0">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getFileExtension(
  fileName: string,
) {
  const parts = fileName.split(".");

  if (parts.length < 2) {
    return "FILE";
  }

  const extension =
    parts[parts.length - 1]
      .trim()
      .toUpperCase();

  return extension || "FILE";
}


function getFileTypeInfo(
  attachment: Attachment,
) {
  const mimeType =
    attachment.mimeType.toLowerCase();

  const extension =
    getFileExtension(
      attachment.fileName,
    );

  if (
    mimeType === "application/pdf" ||
    extension === "PDF"
  ) {
    return {
      label: "PDF",
      kind: "pdf",
      Icon: FileText,
    };
  }

  if (
    mimeType.includes("word") ||
    mimeType.includes("msword") ||
    extension === "DOC" ||
    extension === "DOCX"
  ) {
    return {
      label: extension === "DOC"
        ? "DOC"
        : "DOCX",
      kind: "word",
      Icon: FileText,
    };
  }

  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    extension === "XLS" ||
    extension === "XLSX"
  ) {
    return {
      label: extension === "XLS"
        ? "XLS"
        : "XLSX",
      kind: "excel",
      Icon: FileSpreadsheet,
    };
  }

  if (
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation") ||
    extension === "PPT" ||
    extension === "PPTX"
  ) {
    return {
      label: extension === "PPT"
        ? "PPT"
        : "PPTX",
      kind: "powerpoint",
      Icon: Presentation,
    };
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("compressed") ||
    mimeType.includes("archive") ||
    extension === "ZIP" ||
    extension === "RAR" ||
    extension === "7Z" ||
    extension === "TAR" ||
    extension === "GZ"
  ) {
    return {
      label: extension,
      kind: "archive",
      Icon: FileArchive,
    };
  }

  return {
    label: extension,
    kind: "file",
    Icon: File,
  };
}


function DocumentAttachmentCard({
  attachment,
}: {
  attachment: Attachment;
}) {
  const {
    label,
    Icon,
  } = getFileTypeInfo(
    attachment,
  );

  const formattedSize =
    formatFileSize(
      attachment.fileSize,
    );

  return (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-xl border p-3",
        "bg-background/70 backdrop-blur-sm",
        "transition-colors hover:bg-muted/60",
      )}
    >
      <div
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          "border bg-muted/60",
        )}
      >
        <Icon className="h-6 w-6 text-muted-foreground" />

        <span
          className={cn(
            "absolute -bottom-1 -right-1 rounded-md border px-1.5 py-0.5",
            "bg-background text-[8px] font-bold leading-none",
          )}
        >
          {label}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold"
          title={attachment.fileName}
        >
          {attachment.fileName}
        </p>

        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{label}</span>
          <span aria-hidden="true">•</span>
          <span>{formattedSize}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={attachment.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Open ${attachment.fileName}`}
          title="Open"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        <a
          href={attachment.publicUrl}
          download={attachment.fileName}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Download ${attachment.fileName}`}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}


function VideoAttachmentPreview({
  attachment,
}: {
  attachment: Attachment;
}) {
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const durationLabel =
    formatVideoDuration(
      attachment.duration,
    );

  const togglePlayback = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleFullscreen = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      }

      await video.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      /*
       * Fullscreen can be unavailable in some
       * browsers or embedded contexts.
       */
    }
  };

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement ===
          videoRef.current,
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={attachment.publicUrl}
        controls
        preload="metadata"
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        className="block aspect-video w-full max-h-[420px] rounded-xl object-contain"
      />

      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/75"
          aria-label={`Play ${attachment.fileName}`}
        >
          <Play className="ml-1 h-7 w-7 fill-current" />
        </button>
      )}

      {durationLabel && (
        <div className="pointer-events-none absolute bottom-10 left-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {durationLabel}
        </div>
      )}

      <button
        type="button"
        onClick={handleFullscreen}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/75"
        aria-label={
          isFullscreen
            ? "Exit fullscreen"
            : "Open fullscreen"
        }
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}


function AttachmentPreview({
  attachment,
  onImageClick,
}: {
  attachment: Attachment;
  onImageClick?: () => void;
}) {
  const isImage =
    attachment.mimeType.startsWith("image/");

  const isVideo =
    attachment.mimeType.startsWith("video/");

  if (isImage) {
    return (
      <button
        type="button"
        onClick={onImageClick}
        className="group relative block w-full overflow-hidden rounded-xl text-left"
        aria-label={`Open ${attachment.fileName}`}
      >
        <Image
          src={attachment.publicUrl}
          alt={attachment.fileName}
          width={attachment.width || 800}
          height={attachment.height || 600}
          unoptimized
          className="max-h-[360px] max-w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />

        <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
    );
  }

  if (isVideo) {
    return (
      <VideoAttachmentPreview
        attachment={attachment}
      />
    );
  }

  return (
    <DocumentAttachmentCard
      attachment={attachment}
    />
  );
}

function AttachmentGallery({
  attachments,
}: {
  attachments: Attachment[];
}) {
  const imageAttachments = attachments.filter(
    (attachment) =>
      attachment.mimeType.startsWith("image/"),
  );

  const otherAttachments = attachments.filter(
    (attachment) =>
      !attachment.mimeType.startsWith("image/"),
  );

  const [
    lightboxIndex,
    setLightboxIndex,
  ] = useState<number | null>(null);

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const previousImage = () => {
    setLightboxIndex((current) => {
      if (
        current === null ||
        imageAttachments.length === 0
      ) {
        return current;
      }

      return (
        current - 1 + imageAttachments.length
      ) % imageAttachments.length;
    });
  };

  const nextImage = () => {
    setLightboxIndex((current) => {
      if (
        current === null ||
        imageAttachments.length === 0
      ) {
        return current;
      }

      return (
        current + 1
      ) % imageAttachments.length;
    });
  };

  const openImage = (index: number) => {
    setLightboxIndex(index);
  };

  const visibleImages =
    imageAttachments.slice(0, 4);

  const remainingCount =
    Math.max(imageAttachments.length - 4, 0);

  return (
    <>
      <div className="space-y-2 p-2">
        {imageAttachments.length === 1 && (
          <AttachmentPreview
            attachment={imageAttachments[0]}
            onImageClick={() => openImage(0)}
          />
        )}

        {imageAttachments.length === 2 && (
          <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl">
            {visibleImages.map((attachment, index) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onImageClick={() => openImage(index)}
              />
            ))}
          </div>
        )}

        {imageAttachments.length === 3 && (
          <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl">
            <div className="row-span-2">
              <AttachmentPreview
                attachment={visibleImages[0]}
                onImageClick={() => openImage(0)}
              />
            </div>

            {visibleImages.slice(1).map(
              (attachment, index) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  onImageClick={() =>
                    openImage(index + 1)
                  }
                />
              ),
            )}
          </div>
        )}

        {imageAttachments.length >= 4 && (
          <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl">
            {visibleImages.map(
              (attachment, index) => {
                const isLastVisible =
                  index === 3 &&
                  remainingCount > 0;

                return (
                  <div
                    key={attachment.id}
                    className="relative overflow-hidden"
                  >
                    <AttachmentPreview
                      attachment={attachment}
                      onImageClick={() =>
                        openImage(index)
                      }
                    />

                    {isLastVisible && (
                      <button
                        type="button"
                        onClick={() =>
                          openImage(index)
                        }
                        className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-semibold text-white transition hover:bg-black/55"
                        aria-label={`Open gallery with ${remainingCount} more images`}
                      >
                        +{remainingCount}
                      </button>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}

        {otherAttachments.length > 0 && (
          <div className="space-y-2">
            {otherAttachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageAttachments}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrevious={previousImage}
          onNext={nextImage}
        />
      )}
    </>
  );
}

function groupReactions(
  reactions: Reaction[],
  currentUserId: string,
) {
  const groups = new Map<
    string,
    {
      emoji: string;
      count: number;
      reactedByMe: boolean;
    }
  >();

  for (const reaction of reactions) {
    const existing =
      groups.get(reaction.emoji);

    if (existing) {
      existing.count += 1;

      if (
        reaction.userId ===
        currentUserId
      ) {
        existing.reactedByMe =
          true;
      }
    } else {
      groups.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        reactedByMe:
          reaction.userId ===
          currentUserId,
      });
    }
  }

  return Array.from(
    groups.values(),
  );
}

export default function MessageBubble({
  messageId,
  content,
  isOwn = false,
  isAI = false,
  senderName,
  senderImage,
  status,
  createdAt,
  editedAt,
  deletedAt,
  attachments = [],
  reactions = [],
  currentUserId,
  onToggleReaction,
  onEditMessage,
  onDeleteMessage,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] =
    useState(false);

  const [showMessageMenu, setShowMessageMenu] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [editContent, setEditContent] =
    useState(content);

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const groupedReactions =
    groupReactions(
      reactions,
      currentUserId,
    );

  const isDeleted = Boolean(deletedAt);
  const canModify =
    isOwn &&
    !isAI &&
    !isDeleted &&
    !mutationLoading;

  const handleStartEdit = () => {
    setEditContent(content);
    setShowMessageMenu(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const nextContent = editContent.trim();

    if (!nextContent || nextContent === content) {
      if (nextContent === content) {
        setIsEditing(false);
      }
      return;
    }

    setMutationLoading(true);

    try {
      const success = await onEditMessage(
        messageId,
        nextContent,
      );

      if (success) {
        setIsEditing(false);
      }
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this message?",
    );

    if (!confirmed) {
      return;
    }

    setShowMessageMenu(false);
    setMutationLoading(true);

    try {
      await onDeleteMessage(messageId);
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "group mb-4 flex gap-2.5 sm:mb-5 sm:gap-3",
        isOwn && "justify-end",
      )}
    >
      {!isOwn && (
        <div className="h-9 w-9 shrink-0">
          {senderImage && !isAI ? (
            // Dynamic user avatar URL; intentionally use native img to avoid
            // requiring next/image remote-host configuration for chat avatars.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={senderImage}
              alt={senderName ?? "User"}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              {isAI ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "min-w-0 max-w-[calc(100%-2.75rem)] sm:max-w-[78%]",
          isOwn &&
            "flex flex-col items-end",
        )}
      >
        {senderName && (
          <div
            className={cn(
              "mb-1 flex items-center gap-1.5 px-1",
              isOwn
                ? "justify-end"
                : "justify-start",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-medium leading-none",
                isOwn
                  ? "text-muted-foreground"
                  : "text-muted-foreground",
              )}
            >
              {senderName}
            </span>

            {isAI && (
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-2 text-[10px] font-medium"
              >
                Gemini AI
              </Badge>
            )}
          </div>
        )}

        <div className="relative">
          <div
            className={cn(
              "overflow-hidden shadow-sm transition-all duration-150",
              "rounded-2xl",
              isOwn
                ? "rounded-br-md bg-primary text-primary-foreground shadow-primary/10"
                : "rounded-bl-md",
              !isOwn &&
                !isAI &&
                "bg-muted",
              isAI &&
                "border bg-background",
              isDeleted &&
                "rounded-2xl border border-dashed bg-muted/60 text-muted-foreground shadow-none",
            )}
          >
            {isDeleted ? (
              <div className="px-4 py-3 text-sm italic">
                This message was deleted
              </div>
            ) : isEditing ? (
              <div className="min-w-0 max-w-full p-2">
                <textarea
                  value={editContent}
                  onChange={(event) =>
                    setEditContent(event.target.value)
                  }
                  autoFocus
                  rows={3}
                  maxLength={5000}
                  className={cn(
                    "w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none",
                    "focus:ring-2 focus:ring-ring",
                  )}
                />

                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={mutationLoading}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={
                      mutationLoading ||
                      !editContent.trim() ||
                      editContent.trim() === content
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {attachments.length > 0 && (
                  <AttachmentGallery
                    attachments={attachments}
                  />
                )}

                {content && (
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed",
                      isOwn
                        ? "text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {content}
                  </div>
                )}
              </>
            )}
          </div>

          {canModify && !isEditing && (
            <div
              className={cn(
                "absolute top-1 z-20 opacity-0 transition-all duration-150 group-hover:opacity-100 focus-within:opacity-100",
                "max-sm:opacity-100",
                isOwn
                  ? "-left-9 max-sm:-left-8"
                  : "-right-9 max-sm:-right-8",
              )}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMessageMenu(
                      (value) => !value,
                    )
                  }
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border sm:h-7 sm:w-7",
                    "bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm",
                    "transition-all duration-150",
                    "hover:scale-105 hover:bg-background hover:text-foreground active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  aria-label="Message actions"
                  title="Message actions"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>

                {showMessageMenu && (
                  <div
                    className={cn(
                      "absolute top-8 z-50 w-36 max-w-[calc(100vw-1rem)] rounded-xl border bg-popover/95 p-1 shadow-xl backdrop-blur-md",
                      isOwn
                        ? "left-0 max-sm:left-0 max-sm:right-auto"
                        : "right-0 max-sm:right-0 max-sm:left-auto",
                    )}
                  >
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-xs transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-xs text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "relative mt-1.5 flex min-w-0 items-center gap-1.5",
            isOwn && "justify-end",
          )}
        >
          {!isDeleted && groupedReactions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {groupedReactions.map(
                (reaction) => (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() =>
                      onToggleReaction(
                        messageId,
                        reaction.emoji,
                      )
                    }
                    className={cn(
                      "inline-flex min-h-6 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-none",
                      "bg-background/95 shadow-sm backdrop-blur-sm transition-all duration-150",
                      "hover:-translate-y-0.5 hover:bg-muted active:scale-95",
                      reaction.reactedByMe &&
                        "border-primary/50 bg-primary/10",
                    )}
                    aria-label={`React with ${reaction.emoji}`}
                  >
                    <span>
                      {reaction.emoji}
                    </span>
                    <span className="font-medium">
                      {reaction.count}
                    </span>
                  </button>
                ),
              )}
            </div>
          )}

          {!isDeleted && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowReactionPicker(
                  (value) => !value,
                )
              }
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                "bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm",
                "transition-all duration-150 hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95",
                "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
                showReactionPicker &&
                  "opacity-100",
              )}
              aria-label="Add reaction"
              title="Add reaction"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>

            {showReactionPicker && (
              <div
                className={cn(
                  "absolute bottom-9 z-40 grid grid-cols-4 gap-0.5 rounded-2xl border", "w-max max-w-[calc(100vw-1rem)] bg-popover/95 p-1.5 shadow-xl backdrop-blur-md sm:flex sm:w-max sm:max-w-none", isOwn
                    ? "right-0"
                    : "left-0", "max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2",
                  "sm:flex sm:max-w-none",
                )}
              >
                {REACTION_EMOJIS.map(
                  (emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onToggleReaction(
                          messageId,
                          emoji,
                        );
                        setShowReactionPicker(
                          false,
                        );
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition hover:scale-110 hover:bg-muted active:scale-95 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ),
                )}
              </div>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-1.5 flex min-h-4 items-center gap-1.5 px-1 text-[10px] font-medium tracking-[0.01em] text-muted-foreground/80",
            isOwn && "text-muted-foreground/80",
          )}
        >
          <span>{formatTime(createdAt)}</span>

          {editedAt && !isDeleted && (
            <span className="italic">
              edited
            </span>
          )}

          {isOwn && !isDeleted && (
            <MessageStatus status={status} />
          )}
        </div>
      </div>

      {isOwn && (
        <div className="h-9 w-9 shrink-0 self-end pb-0.5">
          {senderImage && !isAI ? (
            // Dynamic user avatar URL; intentionally use native img to avoid
            // requiring next/image remote-host configuration for chat avatars.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={senderImage}
              alt={senderName ?? "User"}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-border/70 shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted ring-1 ring-border/70 shadow-sm">
              {isAI ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
