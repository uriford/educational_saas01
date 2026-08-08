import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Pencil,
  Users,
  Wallet,
} from "lucide-react";
import { auth } from "@/auth";

import { Button } from "@/components/ui/button";
import { CourseService } from "../services/course.service";
import DeleteCourseButton from "../components/DeleteCourseButton";

type Props = {
  courseId: string;
};

export default async function CourseDetailsPage({ courseId }: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    notFound();
  }

  const course = await CourseService.getById(
    courseId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!course) {
    notFound();
  }

  const statusStyles = {
    ACTIVE:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    INACTIVE:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    ARCHIVED:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {course.name}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[course.status]
              }`}
            >
              {course.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{course.code}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/courses/${course.id}/edit`}>
            <Button className="w-full sm:w-auto">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
          </Link>

          <DeleteCourseButton courseId={courseId} />
        </div>
      </div>

      {/* Overview */}
      <div>
        <h2 className="text-lg font-semibold">Course Overview</h2>

        <p className="text-sm text-muted-foreground">
          Key information about this course.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          icon={<Clock3 className="h-4 w-4" />}
          label="Duration"
          value={course.duration ? `${course.duration} days` : "Not specified"}
        />

        <OverviewCard
          icon={<Wallet className="h-4 w-4" />}
          label="Course Fee"
          value={
            course.fee ? `৳${Number(course.fee).toLocaleString()}` : "Free"
          }
        />

        <OverviewCard
          icon={<Users className="h-4 w-4" />}
          label="Capacity"
          value={course.capacity ? `${course.capacity} students` : "Unlimited"}
        />

        <OverviewCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Schedule"
          value={
            course.startDate
              ? new Date(course.startDate).toLocaleDateString()
              : "Not scheduled"
          }
        />
      </div>

      {/* Course Description */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Description</h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {course.description ||
            "No description has been added for this course."}
        </p>
      </div>

      {/* Course Workspace */}
      <div className="rounded-xl border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Course Workspace</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage everything related to this course from here.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WorkspaceCard
            title="Lessons"
            description="Manage lectures, discussions, tasks, and learning materials."
          />

          <WorkspaceCard
            title="Students"
            description="View enrolled students and manage course participation."
          />

          <WorkspaceCard
            title="Schedule"
            description="Manage classes, sessions, and course timings."
          />

          <WorkspaceCard
            title="Assessments"
            description="Create assessments, exams, and academic evaluations."
          />

          <WorkspaceCard
            title="Results"
            description="Manage published results and student performance."
          />

          <WorkspaceCard
            title="Activity"
            description="Track important activity related to this course."
          />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-3 font-semibold">{value}</p>
    </div>
  );
}

function WorkspaceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-5 transition-colors hover:bg-muted/50">
      <h3 className="font-medium">{title}</h3>

      <p className="mt-2 text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
