"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { AnnouncementService } from "../services/announcement.service";

export async function deleteAnnouncementAction(
  id: string,
) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  return AnnouncementService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );
}