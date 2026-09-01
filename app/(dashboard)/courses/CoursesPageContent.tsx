"use client";

import Link from "next/link";
import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  duration: number | null;
  fee: unknown;
  capacity: number | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  startDate: Date | string | null;
  endDate: Date | string | null;
};

type Props = {
  courses: Course[];
  total: number;
};

export default function CoursesPageContent({
  courses,
  total,
}: Props) {
  const { t, language } = useLanguage();

  const activeCourses = courses.filter(
    (course) => course.status === "ACTIVE",
  ).length;

  const inactiveCourses = courses.filter(
    (course) => course.status === "INACTIVE",
  ).length;

  const archivedCourses = courses.filter(
    (course) => course.status === "ARCHIVED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {t("dashboard.coursesPage.academicManagement")}
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {t("dashboard.coursesPage.title")}
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("dashboard.coursesPage.description")}
          </p>
        </div>

        <Link
          href="/courses/create"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.coursesPage.createCourse")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<BookOpen className="h-4 w-4" />}
          label={t("dashboard.coursesPage.totalCourses")}
          value={total}
          description={t("dashboard.coursesPage.coursesInBranch")}
        />

        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={t("dashboard.coursesPage.active")}
          value={activeCourses}
          description={t("dashboard.coursesPage.currentlyAvailable")}
        />

        <SummaryCard
          icon={<Clock3 className="h-4 w-4" />}
          label={t("dashboard.coursesPage.inactive")}
          value={inactiveCourses}
          description={t("dashboard.coursesPage.notCurrentlyActive")}
        />

        <SummaryCard
          icon={<Archive className="h-4 w-4" />}
          label={t("dashboard.coursesPage.archived")}
          value={archivedCourses}
          description={t("dashboard.coursesPage.archivedPrograms")}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {t("dashboard.coursesPage.allCourses")}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t("dashboard.coursesPage.manageCoursesDescription")}
            </p>
          </div>

          {courses.length > 0 && (
            <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              {courses.length} {t("dashboard.coursesPage.displayed")}
            </span>
          )}
        </div>

        {courses.length === 0 ? (
          <EmptyCoursesState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                language={language}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <span className="text-2xl font-bold tracking-tight">
          {value}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium">{label}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function CourseItem({
  course,
  language,
}: {
  course: Course;
  language: "en" | "bn";
}) {
  const { t } = useLanguage();

  const statusStyles = {
    ACTIVE:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    INACTIVE:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    ARCHIVED:
      "bg-muted text-muted-foreground",
  } as const;

  const statusLabel = {
    ACTIVE: t("dashboard.coursesPage.active"),
    INACTIVE: t("dashboard.coursesPage.inactive"),
    ARCHIVED: t("dashboard.coursesPage.archived"),
  } as const;

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return t("dashboard.coursesPage.notScheduled");
    }

    return new Intl.DateTimeFormat(
      language === "bn" ? "bn-BD" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    ).format(new Date(date));
  };

  const formatFee = (fee: unknown) => {
    if (fee === null || fee === undefined || Number(fee) === 0) {
      return t("dashboard.coursesPage.free");
    }

    return `৳${Number(fee).toLocaleString(
      language === "bn" ? "bn-BD" : "en-BD",
    )}`;
  };

  return (
    <article className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {course.code}
            </p>

            <h3 className="mt-1 line-clamp-2 font-semibold leading-5">
              {course.name}
            </h3>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[course.status]}`}
        >
          {statusLabel[course.status]}
        </span>
      </div>

      <p className="mt-4 min-h-10 line-clamp-2 text-sm leading-5 text-muted-foreground">
        {course.description ||
          t("dashboard.coursesPage.noDescription")}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
        <InfoItem
          icon={<Clock3 className="h-3.5 w-3.5" />}
          value={
            course.duration
              ? `${course.duration} ${t(
                  "dashboard.coursesPage.days",
                )}`
              : t("dashboard.coursesPage.flexible")
          }
        />

        <InfoItem
          icon={<Users className="h-3.5 w-3.5" />}
          value={
            course.capacity
              ? `${course.capacity} ${t(
                  "dashboard.coursesPage.seats",
                )}`
              : t("dashboard.coursesPage.unlimited")
          }
        />

        <InfoItem
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          value={formatDate(course.startDate)}
        />

        <div className="text-sm font-semibold">
          {formatFee(course.fee)}
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("dashboard.coursesPage.viewCourse")}
        </Link>

        <Link
          href={`/courses/${course.id}/edit`}
          className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("dashboard.coursesPage.edit")}
        </Link>
      </div>
    </article>
  );
}

function InfoItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function EmptyCoursesState() {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BookOpen className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {t("dashboard.coursesPage.noCourses")}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {t("dashboard.coursesPage.noCoursesDescription")}
      </p>

      <Link
        href="/courses/create"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        {t("dashboard.coursesPage.createFirstCourse")}
      </Link>
    </div>
  );
}
