"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

type Session = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  room: string | null;
  status:
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";
  course: {
    id: string;
    code: string;
    name: string;
  };
  teacher: {
    id: string;
    teacherId: string;
    firstName: string;
    lastName: string | null;
  };
};

type Props = {
  student: {
    id: string;
    studentId: string;
    name: string;
  };
  sessions: Session[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusStyles(status: Session["status"]) {
  switch (status) {
    case "ONGOING":
      return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40";

    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40";

    default:
      return "border-primary/20 bg-primary/[0.045]";
  }
}

function statusDot(status: Session["status"]) {
  switch (status) {
    case "ONGOING":
      return "bg-blue-500";

    case "COMPLETED":
      return "bg-emerald-500";

    default:
      return "bg-primary";
  }
}

export default function GuardianScheduleBoard({
  student,
  sessions,
}: Props) {
  const now = new Date();

  const upcoming = sessions.filter(
    (session) =>
      new Date(session.endTime) >= now &&
      session.status !== "CANCELLED",
  );

  const nextClass =
    upcoming.find(
      (session) => new Date(session.startTime) >= now,
    ) ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <CalendarDays className="size-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Schedule
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  View {student.name}&apos;s upcoming classes.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {upcoming.length} upcoming{" "}
            {upcoming.length === 1 ? "class" : "classes"}
          </div>
        </div>
      </section>

      {nextClass && (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Next class
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {nextClass.title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {nextClass.course.code} · {nextClass.course.name}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Date
                </p>
                <p className="mt-1 font-medium">
                  {formatDate(nextClass.startTime)}
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Time
                </p>
                <p className="mt-1 font-medium">
                  {formatTime(nextClass.startTime)} –{" "}
                  {formatTime(nextClass.endTime)}
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Teacher
                </p>
                <p className="mt-1 font-medium">
                  {nextClass.teacher.firstName}{" "}
                  {nextClass.teacher.lastName ?? ""}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <CalendarDays className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold">
              No classes scheduled
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no classes scheduled for{" "}
              {student.name}.
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <article
              key={session.id}
              className={[
                "rounded-2xl border p-5 shadow-sm transition",
                statusStyles(session.status),
              ].join(" ")}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "size-2.5 rounded-full",
                        statusDot(session.status),
                      ].join(" ")}
                    />

                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {session.status.toLowerCase()}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold">
                    {session.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.course.code} · {session.course.name}
                  </p>

                  {session.description && (
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                      {session.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                  <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        {formatDate(session.startTime)}
                      </p>

                      <p className="text-muted-foreground">
                        {formatTime(session.startTime)} –{" "}
                        {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        {session.teacher.firstName}{" "}
                        {session.teacher.lastName ?? ""}
                      </p>

                      <p className="text-muted-foreground">
                        Teacher
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        {session.room || "Not assigned"}
                      </p>

                      <p className="text-muted-foreground">
                        Room
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
