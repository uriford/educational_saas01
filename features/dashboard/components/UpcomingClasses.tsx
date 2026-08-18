import {
  CalendarClock,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";

type UpcomingClass = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  room: string | null;
  status: "SCHEDULED" | "ONGOING";
  course: {
    code: string;
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string | null;
  };
};

type UpcomingClassesProps = {
  classes: UpcomingClass[];
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function UpcomingClasses({
  classes,
}: UpcomingClassesProps) {
  return (
    <DashboardSection
      title="Upcoming Classes"
      description="Today's scheduled classes"
    >
      {classes.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming classes"
          description="There are no upcoming classes scheduled for today."
        />
      ) : (
        <div className="space-y-2">
          {classes.map((item) => {
            const teacherName = `${item.teacher.firstName} ${
              item.teacher.lastName ?? ""
            }`.trim();

            const isOngoing = item.status === "ONGOING";

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-border/60 p-4 transition-all duration-200 hover:border-border hover:bg-muted/30 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      isOngoing
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <CalendarClock className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {item.course.code}
                          </span>
                          <span className="mx-1.5 text-muted-foreground/40">
                            •
                          </span>
                          {item.course.name}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isOngoing
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isOngoing
                              ? "bg-emerald-500"
                              : "bg-primary"
                          }`}
                        />
                        {isOngoing ? "Ongoing" : "Scheduled"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        {formatTime(item.startTime)} –{" "}
                        {formatTime(item.endTime)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="size-3.5" />
                        {teacherName}
                      </span>

                      {item.room && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {item.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
