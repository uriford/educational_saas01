import { ArrowUpRight, Pin } from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";

type RecentAnnouncement = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: Date;
};

type RecentAnnouncementsProps = {
  announcements: RecentAnnouncement[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function RecentAnnouncements({
  announcements,
}: RecentAnnouncementsProps) {
  return (
    <DashboardSection
      title="Recent Announcements"
      description="Latest notices from management"
    >
      {announcements.length === 0 ? (
        <EmptyState
          icon={Pin}
          title="No announcements yet"
          description="Announcements from management will appear here."
        />
      ) : (
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="group flex items-start gap-3 rounded-xl border border-border/60 p-3.5 transition-all duration-200 hover:border-border hover:bg-muted/40 hover:shadow-sm"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pin className="size-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {announcement.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>

                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                {announcement.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {announcement.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
