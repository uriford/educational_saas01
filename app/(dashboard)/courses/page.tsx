import Link from "next/link";
import { Plus, BookOpen, Clock, Users, CalendarDays } from "lucide-react";

import {CourseRepository} from "../../../features/courses/repository/course.repository";

type Props = {
  organizationId: string;
  branchId?: string;
};

export default async function CoursesPage({
  organizationId,
  branchId,
}: Props) {
  const { courses } = await CourseRepository.findAll(
    organizationId,
    branchId,
    undefined,
    1,
    50
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Courses
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage courses offered by your organization.
          </p>
        </div>

        <Link
          href="/courses/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">
            No courses yet
          </h3>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first course to start managing your
            organization&rsquo;s academic programs.
          </p>

          <Link
            href="/courses/create"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </div>
      ) : (
        /* Course cards */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {course.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {course.code}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    course.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : course.status === "ARCHIVED"
                        ? "bg-muted text-muted-foreground"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                  }`}
                >
                  {course.status}
                </span>
              </div>

              {/* Description */}
              {course.description && (
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>
              )}

              {/* Information */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {course.duration
                      ? `${course.duration} days`
                      : "Flexible"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {course.capacity
                      ? `${course.capacity} seats`
                      : "Unlimited"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {course.startDate
                      ? new Date(course.startDate).toLocaleDateString()
                      : "No start date"}
                  </span>
                </div>

                <div className="text-sm font-medium">
                  {course.fee
                    ? `৳${Number(course.fee).toLocaleString()}`
                    : "Free"}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2 border-t pt-4">
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="flex-1 rounded-md border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                >
                  Edit
                </Link>

                <Link
                  href={`/courses/${course.id}`}
                  className="flex-1 rounded-md bg-muted px-3 py-2 text-center text-sm font-medium hover:bg-muted/80"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}