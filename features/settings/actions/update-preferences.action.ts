"use server";

import { auth } from "@/auth";
import { SettingsService } from "../services/settings.service";

export async function updatePreferencesAction(data: {
  timezone: string;
  language: string;
  currency: string;
}) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  return SettingsService.updateOrganizationSettings(
    session.user.organizationId,
    data,
  );
}