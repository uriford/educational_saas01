import { z } from "zod";

export const updateOwnStudentProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),

  lastName: z
    .string()
    .trim()
    .max(50, "Last name is too long")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .min(11, "Phone number must be at least 11 characters")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),

  gender: z
    .enum(["MALE", "FEMALE", "OTHER"])
    .optional(),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(255, "Address is too long")
    .optional()
    .or(z.literal("")),

  guardianName: z
    .string()
    .trim()
    .max(100, "Guardian name is too long")
    .optional()
    .or(z.literal("")),

  guardianEmail: z
    .string()
    .trim()
    .email("Invalid guardian email")
    .max(150, "Guardian email is too long")
    .optional()
    .or(z.literal("")),

  guardianPhone: z
    .string()
    .trim()
    .max(20, "Guardian phone is too long")
    .optional()
    .or(z.literal("")),
});

export type UpdateOwnStudentProfileData = z.infer<
  typeof updateOwnStudentProfileSchema
>;
