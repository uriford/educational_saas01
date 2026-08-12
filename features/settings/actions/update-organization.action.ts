"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SettingsService } from "../services/settings.service";
import type { OrganizationSettingsInput } from "../schemas/settings.schema";

export async function updateOrganizationAction(
  data: OrganizationSettingsInput,
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

  const result = await SettingsService.updateOrganization(
    session.user.organizationId,
    session.user.id,
    data,
  );

  if (result.success) {
    revalidatePath("/settings");
  }

  return result;
}
