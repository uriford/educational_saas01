import { z } from "zod";

function normalizeVideoUrl(value: string): string {
  const url = value.trim();

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // Already an embed URL.
    if (
      hostname === "youtube.com" &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return url;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (
      hostname === "youtube.com" &&
      parsed.pathname === "/watch"
    ) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/shorts/VIDEO_ID
    if (
      hostname === "youtube.com" &&
      parsed.pathname.startsWith("/shorts/")
    ) {
      const videoId = parsed.pathname
        .split("/")
        .filter(Boolean)[1];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Keep other valid video URLs unchanged.
    return url;
  } catch {
    return url;
  }
}

const videoUrlSchema = z
  .string()
  .trim()
  .url("Invalid video URL.")
  .transform(normalizeVideoUrl)
  .optional()
  .or(z.literal(""));

export const createLessonSchema = z.object({
  courseId: z
    .string()
    .min(1, "Course is required."),

  title: z
    .string()
    .trim()
    .min(2, "Lesson title is required.")
    .max(200, "Lesson title is too long."),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .optional(),

  content: z
    .string()
    .optional(),

  type: z.enum([
    "TEXT",
    "VIDEO",
    "DOCUMENT",
    "LINK",
  ]),

  videoUrl: videoUrlSchema,

  documentUrl: z
    .string()
    .trim()
    .url("Invalid document URL.")
    .optional()
    .or(z.literal("")),

  externalUrl: z
    .string()
    .trim()
    .url("Invalid external URL.")
    .optional()
    .or(z.literal("")),

  duration: z
    .number()
    .int("Duration must be a whole number.")
    .positive("Duration must be greater than zero.")
    .optional(),
});

export const updateLessonSchema =
  createLessonSchema
    .omit({
      courseId: true,
    })
    .partial()
    .extend({
      title: z
        .string()
        .trim()
        .min(2, "Lesson title is required.")
        .max(200, "Lesson title is too long.")
        .optional(),
    });
