import { z } from "zod";

export const createAccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional(),
  role: z.enum([
    "ORGANIZATION_ADMIN",
    "BRANCH_ADMIN",
  ]),
  branchId: z.string().trim().optional(),
});

export const updateAccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  role: z.enum([
    "ORGANIZATION_ADMIN",
    "BRANCH_ADMIN",
  ]),
  branchId: z.string().trim().optional(),
});

export const updateAccountStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const resetAccountPasswordSchema = z.object({
  userId: z.string().min(1),
});

export const deleteAccountSchema = z.object({
  userId: z.string().min(1),
});

export type CreateAccountInput =
  z.infer<typeof createAccountSchema>;

export type UpdateAccountInput =
  z.infer<typeof updateAccountSchema>;
