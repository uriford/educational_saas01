"use server";

import { auth } from "@/auth";
import { SettingsRepository } from "../repository/settings.repository";

export async function updateUserThemeAction(
  themePreference: "LIGHT" | "DARK" | "SYSTEM",
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const result = await SettingsRepository.updateUserTheme(
    session.user.id,
    themePreference,
  );

  return {
    success: result.count > 0,
    message:
      result.count > 0
        ? "Theme preference updated."
        : "User not found.",
  };
}
