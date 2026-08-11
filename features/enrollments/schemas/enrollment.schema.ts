import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student is required."),

  courseId: z
    .string()
    .min(1, "Course is required."),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum([
    "ACTIVE",
    "COMPLETED",
    "DROPPED",
    "SUSPENDED",
  ]),

  progress: z
    .number()
    .int()
    .min(0)
    .max(100),
});

export type CreateEnrollmentInput = z.infer<
  typeof createEnrollmentSchema
>;

export type UpdateEnrollmentInput = z.infer<
  typeof updateEnrollmentSchema
>;
