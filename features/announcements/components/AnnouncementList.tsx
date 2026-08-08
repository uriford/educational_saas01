import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { Announcement } from "@prisma/client";

type Props = {
  announcements: Announcement[];
};

const statusStyles = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

export default function AnnouncementList({
  announcements,
}: Props) {
  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="font-medium">
          No announcements found.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Create your first announcement to get started.
        </p>

        <Link href="/announcements/create">
          <Button className="mt-4">
            Create Announcement
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-xl border bg-card p-4 transition hover:bg-muted/30"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">
                  {announcement.title}
                </h3>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusStyles[announcement.status]
                  }`}
                >
                  {announcement.status}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {announcement.content}
              </p>

              {announcement.publishAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Publish:{" "}
                  {new Date(
                    announcement.publishAt,
                  ).toLocaleString()}
                </p>
              )}
            </div>

            <Link
              href={`/announcements/${announcement.id}`}
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}