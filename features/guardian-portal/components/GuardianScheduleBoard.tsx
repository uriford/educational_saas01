"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RotateCcw,
  UserRound,
  XCircle,
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

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatWeekRange(start: Date, end: Date) {
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDate(start)} – ${formatDate(end)}, ${end.getFullYear()}`;
  }

  return `${formatDate(start)}, ${start.getFullYear()} – ${formatDate(
    end,
  )}, ${end.getFullYear()}`;
}

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function statusLabel(status: Session["status"]) {
  switch (status) {
    case "ONGOING":
      return "Ongoing";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Scheduled";
  }
}

function statusBadgeStyles(status: Session["status"]) {
  switch (status) {
    case "ONGOING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300";
    default:
      return "bg-primary/10 text-primary";
  }
}

function statusDot(status: Session["status"]) {
  switch (status) {
    case "ONGOING":
      return "bg-blue-500";
    case "COMPLETED":
      return "bg-emerald-500";
    case "CANCELLED":
      return "bg-red-500";
    default:
      return "bg-primary";
  }
}

function StatusIcon({ status }: { status: Session["status"] }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-3.5 shrink-0" />;
  }

  if (status === "CANCELLED") {
    return <XCircle className="size-3.5 shrink-0" />;
  }

  return (
    <span
      className={`size-1.5 shrink-0 rounded-full ${statusDot(status)}`}
    />
  );
}

export default function GuardianScheduleBoard({
  student,
  sessions,
}: Props) {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date()),
  );

  const weekEnd = endOfWeek(currentWeek);

  const weekSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const date = new Date(session.startTime);

        return date >= currentWeek && date <= weekEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      );
  }, [sessions, currentWeek, weekEnd]);

  const days = useMemo(() => {
    return weekDays.map((name, index) => {
      const date = new Date(currentWeek);

      date.setDate(currentWeek.getDate() + index);

      return {
        name,
        date,
        sessions: weekSessions.filter((session) =>
          sameDay(new Date(session.startTime), date),
        ),
      };
    });
  }, [currentWeek, weekSessions]);

  const scheduledCount = weekSessions.filter(
    (item) => item.status === "SCHEDULED",
  ).length;

  const ongoingCount = weekSessions.filter(
    (item) => item.status === "ONGOING",
  ).length;

  const completedCount = weekSessions.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  const cancelledCount = weekSessions.filter(
    (item) => item.status === "CANCELLED",
  ).length;

  const now = new Date();

  const nextClass =
    sessions
      .filter(
        (session) =>
          session.status !== "CANCELLED" &&
          new Date(session.startTime).getTime() >= now.getTime(),
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      )[0] ?? null;

  function previousWeek() {
    const date = new Date(currentWeek);

    date.setDate(date.getDate() - 7);

    setCurrentWeek(date);
  }

  function nextWeek() {
    const date = new Date(currentWeek);

    date.setDate(date.getDate() + 7);

    setCurrentWeek(date);
  }

  function goToToday() {
    setCurrentWeek(startOfWeek(new Date()));
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10">
              <CalendarDays className="size-5 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Schedule
                </h1>

                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {student.name}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                View {student.name}&apos;s weekly classes, teachers,
                rooms, and class times.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {weekSessions.length}{" "}
            {weekSessions.length === 1 ? "class" : "classes"} this
            week
          </div>
        </div>
      </section>

      {/* Week controls */}
      <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={previousWeek}
              aria-label="Previous week"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="min-w-0 flex-1 text-center sm:min-w-[250px]">
              <p className="truncate text-sm font-semibold">
                {formatWeekRange(currentWeek, weekEnd)}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Weekly timetable for {student.name}
              </p>
            </div>

            <button
              type="button"
              onClick={nextWeek}
              aria-label="Next week"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="col-span-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:ml-1 sm:h-10 sm:text-sm"
            >
              <RotateCcw className="size-3.5 sm:size-4" />
              Today
            </button>
          </div>
        </div>
      </section>

      {/* Weekly summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Scheduled", scheduledCount],
          ["Ongoing", ongoingCount],
          ["Completed", completedCount],
          ["Cancelled", cancelledCount],
        ].map(([label, count]) => (
          <div
            key={label}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 text-3xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Next class */}
      {nextClass && (
        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  Next class
                </span>

                <span className="text-xs text-muted-foreground">
                  {student.name}
                </span>
              </div>

              <h2 className="mt-3 text-xl font-bold">
                {nextClass.title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {nextClass.course.code} ·{" "}
                {nextClass.course.name}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[560px]">
              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">
                  Date
                </p>

                <p className="mt-1 font-medium">
                  {formatFullDate(
                    new Date(nextClass.startTime),
                  )}
                </p>
              </div>

              <div className="rounded-xl border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">
                  Time
                </p>

                <p className="mt-1 font-medium">
                  {formatTime(nextClass.startTime)} –{" "}
                  {formatTime(nextClass.endTime)}
                </p>
              </div>

              <div className="rounded-xl border bg-background/70 p-3">
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

      {/* Weekly timetable */}
      <section className="space-y-4">
        {weekSessions.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
              <CalendarDays className="size-6 text-muted-foreground" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              No classes this week
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              There are no scheduled classes for{" "}
              {student.name} during this week.
            </p>
          </div>
        ) : (
          days.map((day) => {
            const isToday = sameDay(day.date, new Date());

            return (
              <section
                key={day.name}
                className={[
                  "overflow-hidden rounded-2xl border bg-card shadow-sm",
                  isToday
                    ? "border-primary/30 ring-1 ring-primary/10"
                    : "",
                ].join(" ")}
              >
                {/* Day header */}
                <div className="flex flex-col gap-2 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      ].join(" ")}
                    >
                      {day.date.getDate()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">
                          {day.name}
                        </h2>

                        {isToday && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Today
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    {day.sessions.length}{" "}
                    {day.sessions.length === 1
                      ? "class"
                      : "classes"}
                  </span>
                </div>

                {/* Day content */}
                {day.sessions.length === 0 ? (
                  <div className="px-5 py-7 text-sm text-muted-foreground sm:px-6">
                    No classes scheduled for this day.
                  </div>
                ) : (
                  <div className="divide-y">
                    {day.sessions.map((session) => {
                      const teacher =
                        `${session.teacher.firstName} ${
                          session.teacher.lastName ?? ""
                        }`.trim();

                      return (
                        <article
                          key={session.id}
                          className="p-5 transition-colors hover:bg-muted/20 sm:p-6"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                  <span
                                    className={`size-1.5 rounded-full ${statusDot(
                                      session.status,
                                    )}`}
                                  />

                                  {session.course.code}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles(
                                    session.status,
                                  )}`}
                                >
                                  <StatusIcon
                                    status={session.status}
                                  />

                                  {statusLabel(session.status)}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-semibold">
                                {session.title}
                              </h3>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {session.course.name}
                              </p>

                              {session.description && (
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                  {session.description}
                                </p>
                              )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
                              <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-start gap-2">
                                  <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Class time
                                    </p>

                                    <p className="mt-1 font-medium">
                                      {formatTime(
                                        session.startTime,
                                      )}{" "}
                                      –{" "}
                                      {formatTime(
                                        session.endTime,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-start gap-2">
                                  <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Teacher
                                    </p>

                                    <p className="mt-1 font-medium">
                                      {teacher}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Room
                                    </p>

                                    <p className="mt-1 font-medium">
                                      {session.room ||
                                        "Not assigned"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </section>
    </div>
  );
}
