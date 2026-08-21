"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { AnnouncementService } from "../services/announcement.service";
import type { UpdateAnnouncementData } from "../types";

export async function updateAnnouncementAction(
  id: string,
  data: UpdateAnnouncementData,
) {
  const session = await requireAdmin();

  
  return AnnouncementService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    data,
  );
}