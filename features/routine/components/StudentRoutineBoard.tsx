"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  MapPin,
  RotateCcw,
  UserRound,
} from "lucide-react";

type RoutineSession = {
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
  sessions: RoutineSession[];
  courses: Course[];
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

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function statusStyles(status: RoutineSession["status"]) {
  switch (status) {
    case "ONGOING":
      return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40";

    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40";

    case "CANCELLED":
      return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40";

    default:
      return "border-primary/20 bg-primary/[0.045]";
  }
}

function statusDot(status: RoutineSession["status"]) {
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

export default function StudentRoutineBoard({
  sessions,
  courses,
}: Props) {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date()),
  );

  const [selectedCourse, setSelectedCourse] =
    useState("ALL");

  const weekEnd = endOfWeek(currentWeek);
  const today = new Date();

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        if (selectedCourse === "ALL") {
          return true;
        }

        return session.courseId === selectedCourse;
      })
      .filter((session) => {
        const date = new Date(session.startTime);

        return date >= currentWeek && date <= weekEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      );
  }, [
    sessions,
    selectedCourse,
    currentWeek,
    weekEnd,
  ]);

  const days = useMemo(() => {
    return weekDays.map((name, index) => {
      const date = new Date(currentWeek);

      date.setDate(currentWeek.getDate() + index);

      return {
        name,
        date,
        sessions: filteredSessions.filter(
          (session) =>
            new Date(session.startTime).getDay() === index,
        ),
      };
    });
  }, [currentWeek, filteredSessions]);

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
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <CalendarDays className="size-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Routine
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your weekly timetable for all enrolled courses.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"} enrolled
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={previousWeek}
              aria-label="Previous week"
              className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="min-w-[220px] text-center">
              <p className="text-sm font-semibold">
                {formatDate(currentWeek)} –{" "}
                {formatDate(weekEnd)}
              </p>

              <p className="text-xs text-muted-foreground">
                {currentWeek.getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={nextWeek}
              aria-label="Next week"
              className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted"
            >
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted"
            >
              <RotateCcw className="size-4" />
              Today
            </button>
          </div>

          <label className="relative">
            <span className="sr-only">
              Filter routine by course
            </span>

            <select
              value={selectedCourse}
              onChange={(event) =>
                setSelectedCourse(event.target.value)
              }
              className="h-10 min-w-[260px] appearance-none rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">
                All enrolled courses
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
          </label>
        </div>
      </section>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Enrolled courses
          </p>

          <p className="mt-2 text-3xl font-bold">
            {courses.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Classes this week
          </p>

          <p className="mt-2 text-3xl font-bold">
            {filteredSessions.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Selected course
          </p>

          <p className="mt-2 truncate text-lg font-bold">
            {selectedCourse === "ALL"
              ? "All courses"
              : courses.find(
                  (course) => course.id === selectedCourse,
                )?.code ?? "Course"}
          </p>
        </div>
      </div>

      {/* Weekly timetable */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Weekly Timetable
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCourse === "ALL"
                  ? "All your enrolled courses."
                  : "Classes for the selected course."}
              </p>
            </div>

            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                Scheduled
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                Ongoing
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto lg:block">
          <div className="grid min-w-[1100px] grid-cols-7 divide-x">
            {days.map((day) => {
              const isToday = sameDay(day.date, today);

              return (
                <div
                  key={day.name}
                  className="min-h-[520px]"
                >
                  <div
                    className={`border-b px-4 py-4 text-center ${
                      isToday
                        ? "bg-primary/[0.06]"
                        : "bg-muted/20"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDay(day.date)}
                    </p>

                    <p
                      className={`mt-1 text-lg font-bold ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {day.date.getDate()}
                    </p>
                  </div>

                  <div className="space-y-3 p-3">
                    {day.sessions.length === 0 ? (
                      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed text-center">
                        <p className="text-xs text-muted-foreground">
                          No classes
                        </p>
                      </div>
                    ) : (
                      day.sessions.map((session) => (
                        <RoutineCard
                          key={session.id}
                          session={session}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile */}
        <div className="divide-y lg:hidden">
          {days.map((day) => {
            const isToday = sameDay(day.date, today);

            return (
              <div key={day.name} className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.name}
                    </p>

                    <p className="mt-1 font-bold">
                      {formatDate(day.date)}
                    </p>
                  </div>

                  {isToday && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Today
                    </span>
                  )}
                </div>

                {day.sessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      No classes scheduled.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.sessions.map((session) => (
                      <RoutineCard
                        key={session.id}
                        session={session}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RoutineCard({
  session,
}: {
  session: RoutineSession;
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${statusStyles(
        session.status,
      )}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex max-w-[75%] items-center gap-1.5 truncate rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
          <span
            className={`size-1.5 shrink-0 rounded-full ${statusDot(
              session.status,
            )}`}
          />

          {session.courseCode}
        </span>

        <span className="text-[10px] font-medium text-muted-foreground">
          {formatTime(session.startTime)}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-5">
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

        <div className="flex items-center gap-1.5">
          <UserRound className="size-3.5 shrink-0" />

          <span className="truncate">
            {session.teacherName}
          </span>
        </div>

        {session.room && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />

            <span className="truncate">
              {session.room}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
