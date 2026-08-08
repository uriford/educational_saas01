"use server";

import { auth } from "@/auth";
import { SettingsService } from "../services/settings.service";

export async function updateOrganizationAction(data: {
  name: string;
  email?: string;
  phone?: string;
  domain?: string;
}) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  return SettingsService.updateOrganization(
    session.user.organizationId,
    data,
  );
}