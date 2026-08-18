import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .or(z.literal("")),

  phone: z.string().trim().optional(),

  domain: z.string().trim().optional(),
});

export const organizationPreferencesSchema = z.object({
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required."),

  language: z.enum(
    ["en", "bn"],
    {
      message: "Please select a supported language.",
    },
  ),

  currency: z
    .string()
    .trim()
    .min(1, "Currency is required."),

  attendanceEnabled: z.boolean(),
});

export const profileSettingsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters."),

  lastName: z.string().trim().optional(),

  phone: z.string().trim().optional(),
});

export type OrganizationSettingsInput = z.infer<
  typeof organizationSettingsSchema
>;

export type OrganizationPreferencesInput = z.infer<
  typeof organizationPreferencesSchema
>;

export type ProfileSettingsInput = z.infer<
  typeof profileSettingsSchema
>;
