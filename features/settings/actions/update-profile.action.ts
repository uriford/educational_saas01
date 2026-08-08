"use server";

import { auth } from "@/auth";
import { SettingsService } from "../services/settings.service";

export async function updateProfileAction(data: {
  firstName: string;
  lastName?: string;
  phone?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  return SettingsService.updateUser(
    session.user.id,
    data,
  );
}