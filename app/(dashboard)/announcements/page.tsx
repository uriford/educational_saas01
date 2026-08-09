import Link from "next/link";

import { Plus } from "lucide-react";

import { requireAdmin } from "@/features/auth/authorization";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/common/Pagination";

import { AnnouncementService } from "@/features/announcements/services/announcement.service";

import AnnouncementList from "@/features/announcements/components/AnnouncementList";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function AnnouncementsPage({
  searchParams,
}: Props) {
  const session = await requireAdmin();

  if (!session?.user?.organizationId) {
    return null;
  }

  const params = await searchParams;

  const search = params.search ?? "";

  const currentPage = Math.max(
    1,
    Number(params.page ?? "1") || 1,
  );

  const result = await AnnouncementService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    search,
    currentPage,
    10,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Announcements
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage announcements for your organization.
          </p>
        </div>

        <Link href="/announcements/create">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </Link>
      </div>

      <AnnouncementList
        announcements={result.announcements}
      />

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        search={search}
        basePath="/announcements"
      />
    </div>
  );
}