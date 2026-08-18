import { z } from "zod";

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

  videoUrl: z
    .string()
    .trim()
    .url("Invalid video URL.")
    .optional()
    .or(z.literal("")),

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
