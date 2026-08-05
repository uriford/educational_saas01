"use client";

import { Pin } from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";
import { recentAnnouncements } from "../data";

export default function RecentAnnouncements() {
  return (
    <DashboardSection
      title="Recent Announcements"
      description="Latest notices from management"
    >
      {recentAnnouncements.length === 0 ? (
        <EmptyState
          icon={Pin}
          title="No announcements yet"
          description="Announcements from management will appear here."
        />
      ) : (
        <div className="space-y-5">
          {recentAnnouncements.map((announcement, index) => (
            <div key={announcement.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Pin className="size-5 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {announcement.date}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {announcement.description}
                  </p>
                </div>
              </div>

              {index !== recentAnnouncements.length - 1 && (
                <div className="mt-5 border-b" />
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}