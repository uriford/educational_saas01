import { z } from "zod";

export const teacherSchema = z.object({
  firstName: z.string().min(2, "First name is required"),

  lastName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z.string().optional(),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),

  dateOfBirth: z.string().optional(),

  qualification: z.string().optional(),

  designation: z.string().optional(),

    salary: z
  .number()
  .optional(),


  address: z.string().optional(),
});

export type TeacherFormValues = z.output<typeof teacherSchema>;