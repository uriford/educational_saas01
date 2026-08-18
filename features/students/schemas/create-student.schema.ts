import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50),

  lastName: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .min(11, "Phone number is too short")
    .max(20)
    .optional()
    .or(z.literal("")),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),

  dateOfBirth: z.string().optional(),

  guardianName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),

  guardianPhone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),

  guardianEmail: z
    .string()
    .trim()
    .email("Invalid guardian email")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("")),

  organizationId: z.string().uuid(),

  branchId: z.string().uuid(),
});

export type CreateStudentSchema = z.infer<
  typeof createStudentSchema
>;