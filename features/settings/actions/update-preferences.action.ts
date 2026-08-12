"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SettingsService } from "../services/settings.service";
import type { OrganizationPreferencesInput } from "../schemas/settings.schema";

export async function updatePreferencesAction(
  data: OrganizationPreferencesInput,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const result =
    await SettingsService.updateOrganizationSettings(
      session.user.organizationId,
      session.user.id,
      data,
    );

  if (result.success) {
    revalidatePath("/settings");
  }

  return result;
}
