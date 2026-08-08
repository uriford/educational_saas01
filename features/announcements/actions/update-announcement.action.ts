"use server";

import { auth } from "@/auth";

import { AnnouncementService } from "../services/announcement.service";

import type { UpdateAnnouncementData } from "../types";

export async function updateAnnouncementAction(
  id: string,
  data: UpdateAnnouncementData,
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

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