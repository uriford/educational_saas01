import { z } from "zod";

export const announcementSchema = z.object({
  title: z
    .string()
    .min(2, "Announcement title is required"),

  content: z
    .string()
    .min(1, "Announcement content is required"),

  status: z.enum([
    "DRAFT",
    "SCHEDULED",
    "PUBLISHED",
    "ARCHIVED",
  ]),

  publishAt: z.coerce.date().optional(),

  expiresAt: z.coerce.date().optional(),
});

export type AnnouncementFormInput =
  z.input<typeof announcementSchema>;

export type AnnouncementFormValues =
  z.output<typeof announcementSchema>;