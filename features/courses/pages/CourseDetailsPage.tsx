import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Archive,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Users,
  Wallet,
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

import { CourseService } from "../services/course.service";
import DeleteCourseButton from "../components/DeleteCourseButton";
import CourseStudents from "@/features/enrollments/components/CourseStudents";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";
import DeleteClassSessionButton from "@/features/class-sessions/components/DeleteClassSessionButton";
import { AssessmentService } from "@/features/assessments/services/assessment.service";
import CourseAssessments from "@/features/assessments/components/CourseAssessments";
import { LessonService } from "@/features/lessons/services/lesson.service";

type Props = {
  courseId: string;
};

const statusStyles = {
  ACTIVE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  INACTIVE:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  ARCHIVED:
    "bg-muted text-muted-foreground",
} as const;

const sessionStatusStyles = {
  SCHEDULED:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  ONGOING:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  COMPLETED:
    "bg-muted text-muted-foreground",
  CANCELLED:
    "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
} as const;

export default async function CourseDetailsPage({ courseId }: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    notFound();
  }

  const organizationId = session.user.organizationId;
  const branchId = session.user.branchId ?? undefined;

  const course = await CourseService.getById(
    courseId,
    organizationId,
    branchId,
  );

  if (!course) {
    notFound();
  }

  const [classSessions, assessments, lessons] = await Promise.all([
    ClassSessionService.getCourseSessions(
      courseId,
      organizationId,
      branchId,
    ),
    AssessmentService.getCourseAssessments(
      courseId,
      organizationId,
      branchId,
    ),
    LessonService.getAll(
      courseId,
      organizationId,
      branchId,
    ),
  ]);

  const plainAssessments = assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    duration: assessment.duration,
    totalMarks: Number(assessment.totalMarks),
    passingMarks: Number(assessment.passingMarks),
    maxAttempts: assessment.maxAttempts,
    status: assessment.status,
    startDate: assessment.startDate
      ? assessment.startDate.toISOString()
      : null,
    endDate: assessment.endDate
      ? assessment.endDate.toISOString()
      : null,
  }));

  const plainCourse = {
    id: course.id,
    organizationId: course.organizationId,
    branchId: course.branchId,
    code: course.code,
    name: course.name,
    description: course.description,
    duration: course.duration,
    fee: course.fee !== null ? Number(course.fee) : null,
    capacity: course.capacity,
    status: course.status,
    startDate: course.startDate
      ? course.startDate.toISOString()
      : null,
    endDate: course.endDate
      ? course.endDate.toISOString()
      : null,
  };

  const plainClassSessions = classSessions.map((classSession) => ({
    id: classSession.id,
    organizationId: classSession.organizationId,
    branchId: classSession.branchId,
    courseId: classSession.courseId,
    teacherId: classSession.teacherId,
    title: classSession.title,
    description: classSession.description,
    startTime: classSession.startTime.toISOString(),
    endTime: classSession.endTime.toISOString(),
    room: classSession.room,
    status: classSession.status,
    createdAt: classSession.createdAt.toISOString(),
    updatedAt: classSession.updatedAt.toISOString(),
    deletedAt: classSession.deletedAt
      ? classSession.deletedAt.toISOString()
      : null,
    createdById: classSession.createdById,
    updatedById: classSession.updatedById,
    teacher: {
      id: classSession.teacher.id,
      teacherId: classSession.teacher.teacherId,
      firstName: classSession.teacher.firstName,
      lastName: classSession.teacher.lastName,
    },
  }));

  const activeSessions = plainClassSessions.filter(
    (item) =>
      item.status === "SCHEDULED" ||
      item.status === "ONGOING",
  ).length;

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/20 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {plainCourse.name}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[plainCourse.status]}`}
                  >
                    {formatStatus(plainCourse.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {plainCourse.code}
                </p>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {plainCourse.description ||
                    "No course description has been added yet."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link href={`/courses/${plainCourse.id}/edit`}>
                <Button className="w-full sm:w-auto">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              </Link>

              <DeleteCourseButton courseId={plainCourse.id} />
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <Fact
            icon={<Clock3 className="h-4 w-4" />}
            label="Duration"
            value={
              plainCourse.duration
                ? `${plainCourse.duration} days`
                : "Not specified"
            }
          />

          <Fact
            icon={<Wallet className="h-4 w-4" />}
            label="Course Fee"
            value={
              plainCourse.fee !== null &&
              plainCourse.fee > 0
                ? `৳${plainCourse.fee.toLocaleString("en-BD")}`
                : "Free"
            }
          />

          <Fact
            icon={<Users className="h-4 w-4" />}
            label="Capacity"
            value={
              plainCourse.capacity
                ? `${plainCourse.capacity} students`
                : "Unlimited"
            }
          />

          <Fact
            icon={<CalendarDays className="h-4 w-4" />}
            label="Start Date"
            value={formatDate(plainCourse.startDate)}
          />
        </div>
      </section>

      {/* Course summary */}
      <section className="space-y-4">
        <SectionHeading
          title="Course Overview"
          description="A quick summary of this academic program."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<BookOpen className="h-4 w-4" />}
            label="Lessons"
            value={lessons.length}
            description="Learning materials"
          />

          <MetricCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Class Sessions"
            value={classSessions.length}
            description={
              activeSessions === 1
                ? "1 upcoming or ongoing"
                : `${activeSessions} upcoming or ongoing`
            }
          />

          <MetricCard
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Assessments"
            value={assessments.length}
            description="Tests and evaluations"
          />

          <MetricCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="End Date"
            value={formatDate(plainCourse.endDate)}
            description="Course schedule"
            valueClassName="text-base"
          />
        </div>
      </section>

      {/* Schedule */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <SectionHeader
          title="Class Schedule"
          description="Manage scheduled classes and course sessions."
          action={
            <Link href={`/courses/${plainCourse.id}/classes/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </Link>
          }
        />

        {plainClassSessions.length === 0 ? (
          <EmptySection
            icon={<CalendarDays className="h-6 w-6" />}
            title="No classes scheduled"
            description="Create the first class session for this course to start building its schedule."
            action={
              <Link
                href={`/courses/${plainCourse.id}/classes/create`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Class
              </Link>
            }
          />
        ) : (
          <div className="divide-y">
            {plainClassSessions.map((classSession) => (
              <div
                key={classSession.id}
                className="p-5 transition hover:bg-muted/20 sm:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">
                        {classSession.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${sessionStatusStyles[classSession.status]}`}
                      >
                        {formatStatus(classSession.status)}
                      </span>
                    </div>

                    {classSession.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {classSession.description}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <MetaItem
                        icon={<CalendarDays className="h-4 w-4" />}
                        value={formatDateTime(classSession.startTime)}
                      />

                      <MetaItem
                        icon={<Clock3 className="h-4 w-4" />}
                        value={`${formatTime(classSession.startTime)} – ${formatTime(classSession.endTime)}`}
                      />

                      <MetaItem
                        icon={<GraduationCap className="h-4 w-4" />}
                        value={`${classSession.teacher.firstName} ${classSession.teacher.lastName ?? ""}`.trim()}
                      />

                      <MetaItem
                        icon={<MapPin className="h-4 w-4" />}
                        value={
                          classSession.room ||
                          "No room assigned"
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:shrink-0">
                    <Link
                      href={`/courses/${course.id}/classes/${classSession.id}/attendance`}
                    >
                      <Button variant="outline" size="sm">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Attendance
                      </Button>
                    </Link>

                    <Link
                      href={`/courses/${course.id}/classes/${classSession.id}/edit`}
                    >
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>

                    <DeleteClassSessionButton
                      sessionId={classSession.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workspace */}
      <section className="space-y-4">
        <SectionHeading
          title="Course Workspace"
          description="Manage the academic content and student activity for this course."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WorkspaceLink
            href={`/courses/${plainCourse.id}/lessons`}
            icon={<BookOpen className="h-5 w-5" />}
            title="Lessons"
            description="Manage lectures, discussions, tasks, and learning materials."
            count={lessons.length}
          />

          <CourseAssessments
            courseId={plainCourse.id}
            assessments={plainAssessments}
          />

          <WorkspaceCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Results"
            description="Manage published results and student performance."
          />

          <WorkspaceCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Activity"
            description="Track important activity related to this course."
          />

          <WorkspaceCard
            icon={<Users className="h-5 w-5" />}
            title="Students"
            description="View enrolled students and manage course enrollment."
          />

          <WorkspaceCard
            icon={<Archive className="h-5 w-5" />}
            title="Course Records"
            description="Review important information and records for this course."
          />
        </div>
      </section>

      {/* Students */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Enrolled Students</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Students currently associated with this course.
          </p>
        </div>

        <CourseStudents
          courseId={plainCourse.id}
          organizationId={organizationId}
          branchId={branchId}
        />
      </section>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <p
        className={`mt-4 font-bold tracking-tight ${valueClassName ?? "text-2xl"}`}
      >
        {value}
      </p>

      <p className="mt-1 text-sm font-medium">{label}</p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function MetaItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="shrink-0">{icon}</span>

      <span className="truncate">{value}</span>
    </div>
  );
}

function WorkspaceLink({
  href,
  icon,
  title,
  description,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
          {count}
        </span>
      </div>

      <h3 className="mt-4 font-semibold transition group-hover:text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Open workspace →
      </p>
    </Link>
  );
}

function WorkspaceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Available from this workspace
      </p>
    </div>
  );
}

function EmptySection({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </div>

        <h3 className="mt-4 font-semibold">{title}</h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <div className="mt-5">{action}</div>
      </div>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
