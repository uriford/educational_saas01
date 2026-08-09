import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AnnouncementService } from "../services/announcement.service";
import DeleteAnnouncementButton from "../components/DeleteAnnouncementButton";
import { requireAdmin } from "@/features/auth/authorization";

type Props = {
  announcementId: string;
};

const statusStyles = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

export default async function AnnouncementDetailsPage({
  announcementId,
}: Props) {
  const session = await requireAdmin();

  if (!session?.user?.organizationId) {
    return null;
  }

  const announcement =
    await AnnouncementService.getById(
      announcementId,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

  if (!announcement) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {announcement.title}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[announcement.status]
              }`}
            >
              {announcement.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Announcement details
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/announcements/${announcement.id}/edit`}
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

          <DeleteAnnouncementButton
            announcementId={announcement.id}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="whitespace-pre-wrap text-sm leading-7">
          {announcement.content}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">
            Publish Date
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {announcement.publishAt
              ? new Date(
                  announcement.publishAt,
                ).toLocaleString()
              : "Not scheduled"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">
            Expiry Date
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {announcement.expiresAt
              ? new Date(
                  announcement.expiresAt,
                ).toLocaleString()
              : "No expiry"}
          </p>
        </div>
      </div>
    </div>
  );
}