"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ChevronDown,
} from "lucide-react";

type StudentSession = {
  id: string;
  courseId: string;
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
    code: string;
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string | null;
  };
};

type Course = {
  id: string;
  code: string;
  name: string;
};

type Props = {
  sessions: StudentSession[];
  courses: Course[];
};

function formatDate(date: string) {
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusStyles(status: StudentSession["status"]) {
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

function statusDot(status: StudentSession["status"]) {
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

function statusLabel(status: StudentSession["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function StudentScheduleBoard({
  sessions,
  courses,
}: Props) {
  const [selectedCourse, setSelectedCourse] =
    useState("ALL");

  const [showCompleted, setShowCompleted] =
    useState(false);

  const upcomingSessions = useMemo(() => {
    const now = new Date();

    return sessions
      .filter((session) => {
        if (selectedCourse === "ALL") {
          return true;
        }

        return session.courseId === selectedCourse;
      })
      .filter((session) => {
        if (showCompleted) {
          return true;
        }

        return new Date(session.endTime) >= now;
      })
      .filter((session) => session.status !== "CANCELLED")
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      );
  }, [
    sessions,
    selectedCourse,
    showCompleted,
  ]);

  const nextClass = upcomingSessions.find(
    (session) =>
      new Date(session.startTime) >= new Date(),
  );

  const courseCount = courses.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
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
                  Schedule
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  See your upcoming classes across all your enrolled courses.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {courseCount}{" "}
            {courseCount === 1 ? "course" : "courses"} enrolled
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Class schedule
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose a course to see only its scheduled classes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative">
              <span className="sr-only">
                Filter by course
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

            <button
              type="button"
              onClick={() =>
                setShowCompleted((value) => !value)
              }
              className={[
                "h-10 rounded-lg border px-3 text-sm font-medium transition",
                showCompleted
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-background hover:bg-muted",
              ].join(" ")}
            >
              {showCompleted
                ? "Showing past classes"
                : "Upcoming only"}
            </button>
          </div>
        </div>
      </section>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Enrolled courses
          </p>

          <p className="mt-2 text-3xl font-bold">
            {courseCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Classes shown
          </p>

          <p className="mt-2 text-3xl font-bold">
            {upcomingSessions.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Next class
          </p>

          <p className="mt-2 text-lg font-bold">
            {nextClass
              ? formatDate(nextClass.startTime)
              : "None scheduled"}
          </p>

          {nextClass && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTime(nextClass.startTime)}
            </p>
          )}
        </div>
      </div>

      {/* Upcoming classes */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">
            Upcoming Classes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your scheduled classes based on your enrolled courses.
          </p>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                <CalendarDays className="size-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No classes found
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                There are no scheduled classes matching your current course filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {upcomingSessions.map((session) => {
              const teacher =
                `${session.teacher.firstName} ${
                  session.teacher.lastName ?? ""
                }`.trim();

              return (
                <article
                  key={session.id}
                  className="p-6 transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(
                            session.status,
                          )}`}
                        >
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

                    <div className="shrink-0 rounded-xl border bg-muted/30 p-4 lg:min-w-[190px]">
                      <p className="text-xs font-medium text-muted-foreground">
                        Class time
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatDate(session.startTime)}
                      </p>

                      <p className="mt-1 text-sm text-primary">
                        {formatTime(session.startTime)} –{" "}
                        {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t pt-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {formatDate(session.startTime)}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4" />
                      {formatTime(session.startTime)} –{" "}
                      {formatTime(session.endTime)}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <UserRound className="size-4" />
                      {teacher}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4" />
                      {session.room || "Room not assigned"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
