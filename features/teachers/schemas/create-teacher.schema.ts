import { z } from "zod";

export const createTeacherSchema = z.object({
  organizationId: z.string().uuid(),

  branchId: z.string().uuid(),

  firstName: z.string().min(2, "First name is required"),

  lastName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z.string().optional(),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),

  dateOfBirth: z.string().optional(),

  qualification: z.string().optional(),

  designation: z.string().optional(),

  salary: z.preprocess(
  (value) =>
    value === "" || value === undefined
      ? undefined
      : Number(value),
  z.number().optional(),
),

  address: z.string().optional(),
});