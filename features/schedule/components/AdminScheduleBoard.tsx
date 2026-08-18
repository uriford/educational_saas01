"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react";

import DeleteClassSessionButton from "@/features/class-sessions/components/DeleteClassSessionButton";

type ScheduleSession = {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string | null;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status:
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";
};

type Course = {
  id: string;
  code: string;
  name: string;
};

type Props = {
  sessions: ScheduleSession[];
  courses: Course[];
  readOnly?: boolean;
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

  const day = result.getDay();

  result.setDate(result.getDate() - day);

  return result;
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatWeekRange(start: Date, end: Date) {
  const sameYear =
    start.getFullYear() === end.getFullYear();

  if (sameYear) {
    return `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start)} – ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(end)}, ${end.getFullYear()}`;
  }

  return `${formatDate(start)}, ${start.getFullYear()} – ${formatDate(
    end,
  )}, ${end.getFullYear()}`;
}

function statusLabel(status: ScheduleSession["status"]) {
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

function statusStyles(status: ScheduleSession["status"]) {
  switch (status) {
    case "ONGOING":
      return "border-blue-200/80 bg-blue-50/80 dark:border-blue-900/70 dark:bg-blue-950/40";

    case "COMPLETED":
      return "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/70 dark:bg-emerald-950/40";

    case "CANCELLED":
      return "border-red-200/80 bg-red-50/80 dark:border-red-900/70 dark:bg-red-950/40";

    default:
      return "border-primary/15 bg-primary/[0.035]";
  }
}

function statusBadgeStyles(status: ScheduleSession["status"]) {
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

function statusDot(status: ScheduleSession["status"]) {
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

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function StatusIcon({
  status,
}: {
  status: ScheduleSession["status"];
}) {
  switch (status) {
    case "COMPLETED":
      return (
        <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground" />
      );

    case "CANCELLED":
      return (
        <XCircle className="size-3.5 shrink-0 text-muted-foreground" />
      );

    default:
      return (
        <span
          className={`size-1.5 shrink-0 rounded-full ${statusDot(status)}`}
        />
      );
  }
}

export default function AdminScheduleBoard({
  sessions,
  courses,
  readOnly = false,
}: Props) {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date()),
  );

  const [selectedCourse, setSelectedCourse] =
    useState("ALL");

  const weekEnd = endOfWeek(currentWeek);

  const weekSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const date = new Date(session.startTime);

        return date >= currentWeek && date <= weekEnd;
      })
      .filter((session) => {
        if (selectedCourse === "ALL") {
          return true;
        }

        return session.courseId === selectedCourse;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      );
  }, [
    sessions,
    currentWeek,
    weekEnd,
    selectedCourse,
  ]);

  const days = useMemo(() => {
    return weekDays.map((dayName, index) => {
      const date = new Date(currentWeek);

      date.setDate(currentWeek.getDate() + index);

      return {
        name: dayName,
        date,
        sessions: weekSessions.filter(
          (session) =>
            new Date(session.startTime).getDay() ===
            index,
        ),
      };
    });
  }, [currentWeek, weekSessions]);

  const today = new Date();

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

  const courseCount = new Set(
    weekSessions.map((item) => item.courseId),
  ).size;

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
    <div className="space-y-6">
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

                {readOnly && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    View only
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage classes, teachers, rooms, and weekly
                schedules.
              </p>
            </div>
          </div>

          {!readOnly && (
            <Link
              href="/schedule/create"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
            >
              <Plus className="size-4" />
              Schedule a Class
            </Link>
          )}
        </div>
      </section>

      {/* Controls */}
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
                Weekly timetable
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

          <div className="relative w-full xl:w-auto">
            <label htmlFor="schedule-course-filter" className="sr-only">
              Filter schedule by course
            </label>

            <select
              id="schedule-course-filter"
              value={selectedCourse}
              onChange={(event) =>
                setSelectedCourse(event.target.value)
              }
              className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring xl:min-w-[250px]"
            >
              <option value="ALL">
                All courses
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.code} — {course.name}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Classes this week"
          value={weekSessions.length}
          hint={`${courseCount} ${
            courseCount === 1 ? "course" : "courses"
          } involved`}
        />

        <SummaryCard
          label="Scheduled"
          value={scheduledCount}
          hint="Upcoming classes"
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
          hint={
            ongoingCount > 0
              ? `${ongoingCount} ongoing now`
              : "Completed classes"
          }
        />

        <SummaryCard
          label="Cancelled"
          value={cancelledCount}
          hint={
            cancelledCount > 0
              ? "Cancelled this week"
              : "No cancellations"
          }
        />
      </div>

      {/* Weekly board */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Weekly Timetable
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {readOnly
                  ? "Your weekly class timetable."
                  : "Manage your scheduled classes from one place."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <StatusLegend
                status="SCHEDULED"
                label="Scheduled"
              />

              <StatusLegend
                status="ONGOING"
                label="Ongoing"
              />

              <StatusLegend
                status="COMPLETED"
                label="Completed"
              />

              <StatusLegend
                status="CANCELLED"
                label="Cancelled"
              />
            </div>
          </div>
        </div>

        {/* Desktop timetable */}
        <div className="hidden overflow-x-auto lg:block">
          <div className="grid min-w-[1120px] grid-cols-7 divide-x">
            {days.map((day) => {
              const isToday = sameDay(
                day.date,
                today,
              );

              return (
                <div
                  key={day.name}
                  className={`min-h-[420px] ${
                    isToday ? "bg-primary/[0.018]" : ""
                  }`}
                >
                  <div
                    className={`border-b px-3 py-4 text-center ${
                      isToday
                        ? "bg-primary/[0.06]"
                        : "bg-muted/20"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        isToday
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDay(day.date)}
                    </p>

                    <div className="mt-1 flex items-center justify-center gap-2">
                      <p
                        className={`text-xl font-bold ${
                          isToday ? "text-primary" : ""
                        }`}
                      >
                        {day.date.getDate()}
                      </p>

                      {isToday && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-3">
                    {day.sessions.length === 0 ? (
                      <EmptyDayState />
                    ) : (
                      day.sessions.map((item) => (
                        <ScheduleCard
                          key={item.id}
                          session={item}
                          readOnly={readOnly}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / tablet timetable */}
        <div className="divide-y lg:hidden">
          {days.map((day) => {
            const isToday = sameDay(
              day.date,
              today,
            );

            return (
              <div
                key={day.name}
                className={`p-4 sm:p-5 ${
                  isToday ? "bg-primary/[0.018]" : ""
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                        isToday
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm font-bold">
                        {day.date.getDate()}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-[0.1em] ${
                          isToday
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day.name}
                      </p>

                      <p className="mt-0.5 text-sm font-semibold">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  </div>

                  {isToday && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      Today
                    </span>
                  )}
                </div>

                {day.sessions.length === 0 ? (
                  <EmptyDayState mobile />
                ) : (
                  <div className="space-y-3">
                    {day.sessions.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        session={item}
                        readOnly={readOnly}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {weekSessions.length === 0 && (
          <div className="border-t bg-muted/[0.12] px-5 py-10 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              No classes found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try another week or change the course filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight">
          {value}
        </p>

        <span className="text-right text-[11px] text-muted-foreground">
          {hint}
        </span>
      </div>
    </div>
  );
}

function StatusLegend({
  status,
  label,
}: {
  status: ScheduleSession["status"];
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`size-2 rounded-full ${statusDot(status)}`}
      />

      {label}
    </span>
  );
}

function EmptyDayState({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed bg-muted/[0.08] text-center ${
        mobile ? "min-h-20 px-4" : "min-h-24 px-3"
      }`}
    >
      <p className="text-xs text-muted-foreground">
        No classes scheduled
      </p>
    </div>
  );
}

function ScheduleCard({
  session,
  readOnly = false,
}: {
  session: ScheduleSession;
  readOnly?: boolean;
}) {
  return (
    <article
      className={`group rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring ${statusStyles(
        session.status,
      )}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex min-w-0 max-w-[68%] items-center gap-1.5 truncate rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground/80">
          <span
            className={`size-1.5 shrink-0 rounded-full ${statusDot(
              session.status,
            )}`}
          />

          <span className="truncate">
            {session.courseCode}
          </span>
        </span>

        <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
          {formatTime(session.startTime)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <StatusIcon status={session.status} />

        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusBadgeStyles(
            session.status,
          )}`}
        >
          {statusLabel(session.status)}
        </span>
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-5">
        {session.title}
      </h3>

      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
        {session.courseName}
      </p>

      <div className="mt-3 space-y-1.5 border-t border-current/10 pt-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock3 className="size-3.5 shrink-0" />

          <span>
            {formatTime(session.startTime)} –{" "}
            {formatTime(session.endTime)}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <UserRound className="size-3.5 shrink-0" />

          <span className="truncate">
            {session.teacherName}
          </span>
        </div>

        {session.room && (
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />

            <span className="truncate">
              {session.room}
            </span>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="mt-3 flex items-center gap-2 border-t border-current/10 pt-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <Link
            href={`/courses/${session.courseId}/classes/${session.id}/edit`}
            aria-label={`Edit ${session.title}`}
            className="inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border bg-background/80 px-2 py-1.5 text-xs font-medium transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Edit3 className="size-3.5" />
            Edit
          </Link>

          <DeleteClassSessionButton
            sessionId={session.id}
          />
        </div>
      )}
    </article>
  );
}
