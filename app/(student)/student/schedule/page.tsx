import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusStyles(status: string) {
  switch (status) {
    case "ONGOING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";

    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

    default:
      return "bg-primary/10 text-primary";
  }
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function StudentSchedulePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    redirect("/login");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Schedule
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your student profile could not be found.
          </p>
        </section>
      </div>
    );
  }

  const sessions =
    await ClassSessionService.getStudentSessions(
      student.id,
      session.user.organizationId,
      session.user.branchId,
    );

  const now = new Date();

  const upcomingSessions = sessions.filter(
    (item) => item.startTime >= now,
  );

  const pastSessions = sessions
    .filter((item) => item.startTime < now)
    .reverse();

  const nextClass = upcomingSessions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />

              <h1 className="text-2xl font-bold tracking-tight">
                Schedule
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Keep track of your upcoming classes and recent sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {upcomingSessions.length} upcoming
            </span>

            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {pastSessions.length} completed
            </span>
          </div>
        </div>
      </section>

      {/* Next class */}
      {nextClass && (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-primary/[0.04] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Next Class
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(
                      nextClass.status,
                    )}`}
                  >
                    {statusLabel(nextClass.status)}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold">
                  {nextClass.title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {nextClass.course.name}
                </p>
              </div>

              <Link
                href={`/student/courses/${nextClass.courseId}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View course
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" />

                <span className="text-xs font-medium">
                  Date
                </span>
              </div>

              <p className="mt-2 font-semibold">
                {formatDate(nextClass.startTime)}
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" />

                <span className="text-xs font-medium">
                  Time
                </span>
              </div>

              <p className="mt-2 font-semibold">
                {formatTime(nextClass.startTime)} –{" "}
                {formatTime(nextClass.endTime)}
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4" />

                <span className="text-xs font-medium">
                  Teacher
                </span>
              </div>

              <p className="mt-2 font-semibold">
                {nextClass.teacher.firstName}{" "}
                {nextClass.teacher.lastName ?? ""}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Upcoming Classes
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Your next scheduled classes.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {upcomingSessions.length}
          </span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <CalendarDays className="size-6 text-primary" />
              </div>

              <h3 className="mt-5 font-semibold">
                No upcoming classes
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You currently have no upcoming classes
                scheduled for your enrolled courses.
              </p>

              <Link
                href="/student/courses"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View my courses
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {upcomingSessions.map((classSession) => (
              <div
                key={classSession.id}
                className="p-6 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {classSession.course.code}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles(
                          classSession.status,
                        )}`}
                      >
                        {statusLabel(classSession.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold">
                      {classSession.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {classSession.course.name}
                    </p>

                    {classSession.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {classSession.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {formatDate(classSession.startTime)}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="size-4" />
                        {formatTime(classSession.startTime)} –{" "}
                        {formatTime(classSession.endTime)}
                      </span>

                      {classSession.room && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="size-4" />
                          {classSession.room}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                      <UserRound className="size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Teacher
                        </p>

                        <p className="text-sm font-medium">
                          {classSession.teacher.firstName}{" "}
                          {classSession.teacher.lastName ?? ""}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/student/courses/${classSession.courseId}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Course
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                Previous Classes
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Your recently scheduled and completed sessions.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {pastSessions.length}
          </span>
        </div>

        {pastSessions.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center p-8">
            <div className="text-center">
              <Clock3 className="mx-auto size-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No previous classes
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Your completed classes will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {pastSessions.slice(0, 10).map((classSession) => (
              <div
                key={classSession.id}
                className="p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {classSession.course.code}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles(
                          classSession.status,
                        )}`}
                      >
                        {statusLabel(classSession.status)}
                      </span>
                    </div>

                    <p className="mt-1 font-medium">
                      {classSession.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {classSession.course.name}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium">
                      {formatDate(classSession.startTime)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTime(classSession.startTime)} –{" "}
                      {formatTime(classSession.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
