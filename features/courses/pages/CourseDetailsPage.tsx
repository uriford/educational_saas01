import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CalendarDays,
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

type Props = {
  courseId: string;
};

const statusStyles = {
  ACTIVE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  INACTIVE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  ARCHIVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
} as const;

const sessionStatusStyles = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  ONGOING:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  COMPLETED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
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

  const classSessions = await ClassSessionService.getCourseSessions(
    courseId,
    organizationId,
    branchId,
  );

  const assessments = await AssessmentService.getCourseAssessments(
    courseId,
    organizationId,
    branchId,
  );

  const plainAssessments = assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    duration: assessment.duration,
    totalMarks: Number(assessment.totalMarks),
    passingMarks: Number(assessment.passingMarks),
    maxAttempts: assessment.maxAttempts,
    status: assessment.status,
    startDate: assessment.startDate ? assessment.startDate.toISOString() : null,
    endDate: assessment.endDate ? assessment.endDate.toISOString() : null,
  }));
  /*
   * Convert Prisma objects into plain serializable data.
   *
   * This prevents Prisma Decimal objects from crossing
   * Server -> Client component boundaries.
   */
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
    startDate: course.startDate ? course.startDate.toISOString() : null,
    endDate: course.endDate ? course.endDate.toISOString() : null,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    deletedAt: course.deletedAt ? course.deletedAt.toISOString() : null,
    createdById: course.createdById,
    updatedById: course.updatedById,
  };

  /*
   * Only plain values are kept for class sessions.
   * We deliberately do not pass the nested Prisma course,
   * teacher salary, or branch objects anywhere.
   */
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {plainCourse.name}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[plainCourse.status]
              }`}
            >
              {plainCourse.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {plainCourse.code}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/courses/${plainCourse.id}/edit`}>
            <Button className="w-full sm:w-auto">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
          </Link>

          <DeleteCourseButton courseId={plainCourse.id} />
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
          value={
            plainCourse.duration
              ? `${plainCourse.duration} days`
              : "Not specified"
          }
        />

        <OverviewCard
          icon={<Wallet className="h-4 w-4" />}
          label="Course Fee"
          value={
            plainCourse.fee !== null
              ? `৳${plainCourse.fee.toLocaleString()}`
              : "Free"
          }
        />

        <OverviewCard
          icon={<Users className="h-4 w-4" />}
          label="Capacity"
          value={
            plainCourse.capacity
              ? `${plainCourse.capacity} students`
              : "Unlimited"
          }
        />

        <OverviewCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Schedule"
          value={
            plainCourse.startDate
              ? new Date(plainCourse.startDate).toLocaleDateString()
              : "Not scheduled"
          }
        />
      </div>

      {/* Course Description */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Description</h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {plainCourse.description ||
            "No description has been added for this course."}
        </p>
      </div>

      {/* Course Schedule */}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Class Schedule</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage scheduled classes and course sessions.
            </p>
          </div>

          <Link href={`/courses/${plainCourse.id}/classes/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </Link>
        </div>

        {plainClassSessions.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">No classes scheduled</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create the first class session for this course to start building
                its schedule.
              </p>

              <Link
                href={`/courses/${plainCourse.id}/classes/create`}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Class
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {plainClassSessions.map((classSession) => (
              <div
                key={classSession.id}
                className="p-6 transition hover:bg-muted/30"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">{classSession.title}</h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          sessionStatusStyles[classSession.status]
                        }`}
                      >
                        {classSession.status}
                      </span>
                    </div>

                    {classSession.description && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {classSession.description}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0" />

                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(classSession.startTime))}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 shrink-0" />

                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(classSession.startTime))}{" "}
                          -{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(classSession.endTime))}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 shrink-0" />

                        <span>
                          {classSession.teacher.firstName}{" "}
                          {classSession.teacher.lastName ?? ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />

                        <span>{classSession.room || "No room assigned"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/courses/${course.id}/classes/${classSession.id}/edit`}
                    >
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>

                    <DeleteClassSessionButton sessionId={classSession.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

          <CourseAssessments
            courseId={plainCourse.id}
            assessments={plainAssessments}
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

        <div className="mt-6">
          <CourseStudents
        courseId={plainCourse.id}
        organizationId={organizationId}
        branchId={branchId}
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
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
    <div className="rounded-xl border p-5">
      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
