import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),

  lastName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z.string().min(11, "Phone number is required"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),

  dateOfBirth: z.string().optional(),

  address: z.string().optional(),

  guardianName: z.string().min(2, "Guardian name is required"),

  guardianEmail: z
    .string()
    .trim()
    .email("Invalid guardian email")
    .optional()
    .or(z.literal("")),
    
  guardianPhone: z.string().min(11, "Guardian phone is required"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;