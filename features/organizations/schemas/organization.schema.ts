import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required."),

  email: z
    .string()
    .trim()
    .email("Invalid organization email."),

  phone: z
    .string()
    .trim()
    .optional(),

  adminFirstName: z
    .string()
    .trim()
    .min(2, "Admin first name is required."),

  adminLastName: z
    .string()
    .trim()
    .optional(),

  adminEmail: z
    .string()
    .trim()
    .email("Invalid admin email."),

  hasBranches: z.boolean(),

  adminPassword: z
    .string()
    .min(
      8,
      "Organization admin password must be at least 8 characters.",
    )
    .regex(
      /[A-Z]/,
      "Password must contain at least one uppercase letter.",
    )
    .regex(
      /[a-z]/,
      "Password must contain at least one lowercase letter.",
    )
    .regex(
      /\d/,
      "Password must contain at least one number.",
    ),
});

export type CreateOrganizationInput =
  z.infer<typeof createOrganizationSchema>;
