import type { AnnouncementStatus } from "@prisma/client";

export type CreateAnnouncementData = {
  title: string;
  content: string;
  status?: AnnouncementStatus;
  publishAt?: Date;
  expiresAt?: Date;
};

export type CreateAnnouncementRepositoryData =
  CreateAnnouncementData & {
    organizationId: string;
    branchId?: string;
    createdById?: string;
  };

export type UpdateAnnouncementData =
  Partial<CreateAnnouncementData>;