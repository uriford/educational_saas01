import { z } from "zod";

export const admissionSchema = z.object({
    website: z.string().optional(),
  firstName: z
    .string()
    .min(2, "First name is required"),

  lastName: z
    .string()
    .optional(),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .min(8, "Phone number is required"),

  guardianName: z
    .string()
    .min(2, "Guardian name is required"),

  guardianPhone: z
    .string()
    .min(8, "Guardian phone is required"),

  guardianEmail: z
    .string()
    .email("Invalid guardian email")
    .optional()
    .or(z.literal("")),

  gender: z
    .enum([
      "MALE",
      "FEMALE",
      "OTHER",
    ])
    .optional(),

  dateOfBirth: z
    .string()
    .optional(),

  address: z
    .string()
    .optional(),

  courseId: z
    .string()
    .min(1, "Course selection is required"),

  paymentMethod: z
    .enum([
      "MOBILE_BANKING",
      "BANK_TRANSFER",
      "CARD",
      "OTHER",
    ]),

  requestedAmount: z.coerce
    .number()
    .positive("Amount must be positive"),

  transactionId: z
    .string()
    .optional(),

  paymentPhone: z
    .string()
    .optional(),

  paymentDate: z
    .string()
    .optional(),

  paymentReference: z
    .string()
    .optional(),

  cardHolderName: z
    .string()
    .optional(),

  cardLastFour: z
    .string()
    .optional(),

  paymentNote: z
    .string()
    .optional(),

  admissionNote: z
    .string()
    .optional(),
});

export type AdmissionFormData =
  z.infer<typeof admissionSchema>;
