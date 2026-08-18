import { z } from "zod";

export const createPaymentInstallmentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
});

export const createPaymentPlanSchema = z.object({
  enrollmentId: z.string().uuid(),
  totalAmount: z.coerce.number().positive("Total amount must be greater than 0"),
  installments: z
    .array(createPaymentInstallmentSchema)
    .min(1, "At least one installment is required"),
});

export const recordPaymentSchema = z.object({
  installmentId: z.string().uuid(),
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  paymentDate: z.coerce.date().optional(),
  method: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "MOBILE_BANKING",
    "OTHER",
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentPlanInput = z.infer<
  typeof createPaymentPlanSchema
>;

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
