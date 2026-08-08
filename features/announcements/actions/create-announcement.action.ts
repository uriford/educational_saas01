"use server";

import { auth } from "@/auth";

import { AnnouncementService } from "../services/announcement.service";

import type { CreateAnnouncementData } from "../types";

export async function createAnnouncementAction(
  data: CreateAnnouncementData,
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  return AnnouncementService.create({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId ?? undefined,
    createdById: session.user.id,
  });
}