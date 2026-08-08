import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(1, "Course code is required"),

  name: z.string().min(2, "Course name is required"),

  description: z.string().optional(),

  duration: z.coerce.number().optional(),

  fee: z.coerce.number().optional(),

  capacity: z.coerce.number().optional(),

  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),

  startDate: z.string().optional(),

  endDate: z.string().optional(),
});

export type CourseFormInput = z.input<typeof courseSchema>;

export type CourseFormValues = z.output<typeof courseSchema>;