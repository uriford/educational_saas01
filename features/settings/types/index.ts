export type OrganizationSettingsFormValues = {
  logo: string | null;
  name: string;
  email: string;
  phone: string;
  domain: string;
  timezone: string;
  language: "en" | "bn";
  currency: string;
  attendanceEnabled: boolean;
};

export type ProfileSettingsFormValues = {
  avatar: string | null;
  firstName: string;
  lastName: string;
  phone: string;
};
