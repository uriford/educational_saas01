"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
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

  const result = await SettingsService.updateUser(
    session.user.id,
    data,
  );

  if (result.success) {
    revalidatePath("/settings");
  }

  return result;
}
