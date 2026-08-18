import { z } from "zod";

export const createGuardianSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50),

  lastName: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("A valid email is required."),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  branchId: z
    .string()
    .uuid("A valid branch is required."),

  students: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        relationship: z
          .string()
          .trim()
          .max(50)
          .optional()
          .or(z.literal("")),
      }),
    )
    .min(1, "At least one student must be linked."),
});

export const updateGuardianSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50),

  lastName: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  branchId: z
    .string()
    .uuid("A valid branch is required."),

  students: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        relationship: z
          .string()
          .trim()
          .max(50)
          .optional()
          .or(z.literal("")),
      }),
    )
    .min(1, "At least one student must be linked."),
});

export const updateGuardianStatusSchema = z.object({
  guardianId: z.string().uuid(),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type CreateGuardianInput = z.infer<
  typeof createGuardianSchema
>;

export type UpdateGuardianInput = z.infer<
  typeof updateGuardianSchema
>;

export type UpdateGuardianStatusInput = z.infer<
  typeof updateGuardianStatusSchema
>;
