"use server";

import { auth } from "@/auth";

import { AnnouncementService } from "../services/announcement.service";

export async function getAnnouncementsAction(
  search = "",
  page = 1,
  limit = 10,
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Unauthorized.",
      data: null,
    };
  }

  const data = await AnnouncementService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    search,
    page,
    limit,
  );

  return {
    success: true,
    message: "Announcements fetched successfully.",
    data,
  };
}