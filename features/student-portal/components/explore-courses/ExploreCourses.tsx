"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Search,
  Sparkles,
  Users,
  CalendarDays,
} from "lucide-react";
import { useMemo, useState } from "react";

type ExploreCourse = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  duration: number | null;
  fee: number | null;
  capacity: number | null;
  enrolledCount: number;
  status: string;
  enrollmentStatus:
    | "ACTIVE"
    | "COMPLETED"
    | "DROPPED"
    | "SUSPENDED"
    | null;
  enrolled: boolean;
  enrollment: {
    id: string;
    status: string;
    progress: number;
    enrolledAt: Date | string;
  } | null;
  startDate: string | null;
  endDate: string | null;
};

type ExploreCoursesProps = {
  courses: ExploreCourse[];
};

function formatPrice(price: number | null) {
  if (price === null || price === undefined || price <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ExploreCourses({
  courses,
}: ExploreCoursesProps) {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    });
  }, [courses, search]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <Sparkles className="size-3.5" />
            Discover your next course
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Learn something new.
            <span className="block text-primary">
              Grow with confidence.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore courses designed to help you build practical skills,
            strengthen your knowledge, and reach your academic goals.
          </p>

          <div className="mt-7 flex h-12 items-center gap-3 rounded-xl border bg-background px-4 shadow-sm">
            <Search className="size-5 shrink-0 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Section heading */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />

              <h2 className="text-xl font-semibold">
                Explore Courses
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Find the right course for your learning journey.
            </p>
          </div>

          <div className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "course"
              : "courses"}{" "}
            available
          </div>
        </div>
      </section>

      {/* Empty state */}
      {filteredCourses.length === 0 ? (
        <section className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed bg-muted/20 p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="size-8 text-primary" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {search
                ? "No matching courses"
                : "No courses available yet"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {search
                ? "Try searching with another course name, code, or keyword."
                : "New courses will appear here when they become available for enrollment."}
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const isFull =
              course.capacity !== null &&
              course.enrolledCount >= course.capacity &&
              !course.enrolled;

            const startDate = formatDate(course.startDate);
            const endDate = formatDate(course.endDate);

            return (
              <article
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Course visual */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_35%)]" />

                  <div className="absolute left-5 top-5 flex size-12 items-center justify-center rounded-xl bg-background/90 shadow-sm backdrop-blur">
                    <GraduationCap className="size-6 text-primary" />
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                    <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur">
                      {course.code}
                    </span>

                    {course.enrolled && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-700 backdrop-blur dark:text-green-400">
                        <CheckCircle2 className="size-3.5" />
                        {course.enrollmentStatus === "COMPLETED"
                          ? "Completed"
                          : "Enrolled"}
                      </span>
                    )}

                    {!course.enrolled && isFull && (
                      <span className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive backdrop-blur">
                        Full
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {course.name}
                  </h3>

                  <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                    {course.description ||
                      "Explore this course to learn more about the curriculum, skills, and learning opportunities."}
                  </p>

                  {/* Metadata */}
                  <div className="mt-5 space-y-2">
                    {course.duration !== null && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        <span>
                          {course.duration}{" "}
                          {course.duration === 1
                            ? "day"
                            : "days"}
                        </span>
                      </div>
                    )}

                    {startDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        <span>
                          Starts {startDate}
                        </span>
                      </div>
                    )}

                    {endDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        <span>
                          Ends {endDate}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="size-3.5" />

                      {course.capacity !== null ? (
                        <span>
                          {course.enrolledCount} /{" "}
                          {course.capacity} seats filled
                        </span>
                      ) : (
                        <span>
                          {course.enrolledCount} enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-6 flex items-end justify-between gap-4 border-t pt-5">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Course fee
                      </p>

                      <p className="mt-1 text-xl font-bold tracking-tight">
                        {formatPrice(course.fee)}
                      </p>
                    </div>

                    <Link
                      href={`/student/explore-courses/${course.id}`}
                      className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors ${
                        isFull
                          ? "pointer-events-none bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      aria-disabled={isFull}
                    >
                      {course.enrolled
                        ? "View Course"
                        : isFull
                          ? "Full"
                          : "Explore"}

                      {!isFull && (
                        <ArrowRight className="ml-1 size-4" />
                      )}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
