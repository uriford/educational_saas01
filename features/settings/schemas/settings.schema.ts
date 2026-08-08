import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters."),

  email: z
    .string()
    .email("Enter a valid email address.")
    .or(z.literal("")),

  phone: z.string().optional(),

  domain: z.string().optional(),

  timezone: z.string().min(1),

  language: z.string().min(1),

  currency: z.string().min(1),
});

export const profileSettingsSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters."),

  lastName: z.string().optional(),

  phone: z.string().optional(),
});

export type OrganizationSettingsInput = z.infer<
  typeof organizationSettingsSchema
>;

export type ProfileSettingsInput = z.infer<
  typeof profileSettingsSchema
>;