import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

type ClassSession = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  room: string | null;
  status: string;
  teacher: {
    firstName: string;
    lastName: string | null;
  };
};

type Props = {
  classes: ClassSession[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function StudentUpcomingClasses({
  classes,
}: Props) {
  if (classes.length === 0) {
    return (
      <div className="mt-6 flex min-h-40 items-center justify-center rounded-xl border border-dashed">
        <div className="text-center">
          <CalendarDays className="mx-auto size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            No upcoming classes
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your scheduled classes will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {classes.map((classSession) => (
        <div
          key={classSession.id}
          className="rounded-xl border p-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold">
                {classSession.title}
              </h3>

              {classSession.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {classSession.description}
                </p>
              )}
            </div>

            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {classSession.status}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>
                {formatDate(classSession.startTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="size-4" />
              <span>
                {formatTime(classSession.startTime)} –{" "}
                {formatTime(classSession.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>
                {classSession.room || "Room not assigned"}
              </span>
            </div>

            <div className="truncate">
              Teacher:{" "}
              <span className="font-medium text-foreground">
                {classSession.teacher.firstName}{" "}
                {classSession.teacher.lastName || ""}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
