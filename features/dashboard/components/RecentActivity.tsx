import {
  Activity,
  Bell,
  BookOpen,
  CalendarClock,
  GraduationCap,
  UserPlus,
  Users,
} from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";

type RecentActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description?: string | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string | null;
  } | null;
};

type RecentActivityProps = {
  activities: RecentActivityItem[];
};

function getActivityIcon(entityType: string) {
  const type = entityType.toLowerCase();

  if (type.includes("student")) return UserPlus;
  if (type.includes("teacher")) return GraduationCap;
  if (type.includes("course")) return BookOpen;
  if (type.includes("class")) return CalendarClock;
  if (type.includes("announcement")) return Bell;
  if (type.includes("user")) return Users;

  return Activity;
}

function formatRelativeTime(date: Date) {
  const now = Date.now();
  const time = new Date(date).getTime();
  const difference = Math.max(0, now - time);

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEntityType(entityType: string) {
  return entityType
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <DashboardSection
      title="Recent Activity"
      description="Latest actions across your organization"
    >
      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="Actions performed in your organization will appear here."
        />
      ) : (
        <div className="relative">
          <div className="absolute bottom-5 left-5 top-5 w-px bg-border" />

          <div className="space-y-1">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.entityType);

              const actor = activity.user
                ? `${activity.user.firstName} ${
                    activity.user.lastName ?? ""
                  }`.trim()
                : "System";

              const title =
                activity.description ||
                `${formatAction(activity.action)} ${formatEntityType(
                  activity.entityType,
                )}`;

              return (
                <div
                  key={activity.id}
                  className="group relative flex gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                    <Icon className="size-4 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <h3 className="text-sm font-semibold leading-5">
                        {title}
                      </h3>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {actor}
                      <span className="mx-1.5 text-muted-foreground/40">
                        •
                      </span>
                      {formatAction(activity.action)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
