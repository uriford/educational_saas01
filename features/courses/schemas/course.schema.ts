import { z } from "zod";

const courseFields = {
  code: z
    .string()
    .trim()
    .min(1, "Course code is required")
    .max(50, "Course code must be 50 characters or less")
    .transform((value) => value.toUpperCase()),

  name: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters")
    .max(150, "Course name must be 150 characters or less"),

  description: z
    .string()
    .trim()
    .max(5000, "Description is too long")
    .optional(),

  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(0, "Duration cannot be negative")
    .optional(),

  fee: z
    .number()
    .finite("Course fee must be a valid number")
    .min(0, "Course fee cannot be negative")
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .optional(),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
  ]),

  startDate: z
    .string()
    .optional(),

  endDate: z
    .string()
    .optional(),
};

export const courseSchema = z
  .object(courseFields)
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      path: ["endDate"],
      message: "End date cannot be before the start date.",
    },
  );

export const updateCourseSchema = z
  .object({
    ...courseFields,
  })
  .partial()
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      path: ["endDate"],
      message: "End date cannot be before the start date.",
    },
  );

export type CourseFormValues = z.infer<typeof courseSchema>;

export type CourseFormInput = CourseFormValues;

export type UpdateCourseFormValues =
  z.infer<typeof updateCourseSchema>;

export type UpdateCourseFormInput =
  UpdateCourseFormValues;
