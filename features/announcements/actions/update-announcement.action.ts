"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { AnnouncementService } from "../services/announcement.service";
import type { UpdateAnnouncementData } from "../types";

export async function updateAnnouncementAction(
  id: string,
  data: UpdateAnnouncementData,
) {
  const session = await requireAdmin();

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Organization or Branch not found.",
    };
  }

  return AnnouncementService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    data,
  );
}