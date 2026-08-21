import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  ClipboardCheck,
  UserRound,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { EnrollmentService } from "@/features/enrollments/services/enrollment.service";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";
import { AssessmentRepository } from "@/features/assessments/repository/assessment.repository";
import { LessonProgressService } from "@/features/lessons-progress/services/lesson-progress.service";
import { getAIPersonalizationAction } from "@/features/ai-personalization/actions/ai-personalization.actions";
import { getMyPaymentHistoryAction } from "@/features/payments/actions/get-my-payment-history.action";
import AIPersonalizationCard from "@/features/ai-personalization/components/AIPersonalizationCard";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

function formatDate(date: Date | string | null) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function lessonTypeLabel(type: string) {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "DOCUMENT":
      return "Document";
    case "LINK":
      return "External Resource";
    default:
      return "Reading";
  }
}

export default async function StudentCoursePage({
  params,
}: Props) {
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

  const { courseId } = await params;

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="size-7 text-muted-foreground" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Student profile not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your account is authenticated, but no student
            profile is connected to it yet.
          </p>
        </div>
      </div>
    );
  }

  const enrollments =
    await EnrollmentService.getStudentEnrollments(
      student.id,
      session.user.organizationId,
      session.user.branchId,
    );

  const enrollment = enrollments.find(
    (item) => item.courseId === courseId,
  );

  if (!enrollment) {
    redirect("/student/courses");
  }

  const { course } = enrollment;

  const [
    sessions,
    assessments,
    lessonResult,
    aiPersonalizationResult,
    paymentHistory,
  ] = await Promise.all([
    ClassSessionService.getCourseSessions(
      course.id,
      session.user.organizationId,
      session.user.branchId,
    ),
    AssessmentRepository.findByCourse(
      course.id,
      session.user.organizationId,
      session.user.branchId,
    ),
    LessonProgressService.getCourseLessons(
      student.id,
      course.id,
      session.user.organizationId,
      session.user.branchId,
    ),
    getAIPersonalizationAction(course.id),
    getMyPaymentHistoryAction(),
  ]);

  const courseLessons =
    lessonResult.success
      ? lessonResult.lessons ?? []
      : [];

  const aiPersonalization =
    aiPersonalizationResult.success &&
    "personalization" in aiPersonalizationResult
      ? aiPersonalizationResult.personalization
      : null;

  const coursePayments = paymentHistory.filter(
    (transaction) =>
      transaction.installment.paymentPlan.enrollment.course.id ===
      course.id,
  );

  const courseFee =
    coursePayments[0]?.installment.paymentPlan.totalAmount
      ? Number(
          coursePayments[0].installment.paymentPlan.totalAmount,
        )
      : 0;

  const paidAmount = coursePayments.reduce(
    (sum, transaction) =>
      sum + Number(transaction.amount),
    0,
  );

  const remainingAmount = Math.max(
    courseFee - paidAmount,
    0,
  );

  const now = new Date();

  const upcomingSessions = sessions
    .filter(
      (item) =>
        item.startTime >= now &&
        item.status !== "CANCELLED",
    )
    .slice(0, 5);

  const publishedAssessments = assessments
    .filter((item) => item.status === "PUBLISHED")
    .filter((item) => {
      if (!item.endDate) return true;
      return new Date(item.endDate) >= now;
    })
    .slice(0, 5);

  const progress = Math.min(
    Math.max(enrollment.progress, 0),
    100,
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Back */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to My Courses
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="size-7 text-primary" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {course.code}
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {statusLabel(enrollment.status)}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {course.name}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {course.description ||
                    "No description has been added for this course."}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border bg-background/80 p-5 backdrop-blur">
              <p className="text-xs font-medium text-muted-foreground">
                Course progress
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold">
                  {progress}
                </span>

                <span className="pb-1 text-sm text-muted-foreground">
                  %
                </span>
              </div>

              <div className="mt-3 h-2 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid border-t sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b p-5 sm:border-r lg:border-b-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-xs font-medium">
                Start date
              </span>
            </div>

            <p className="mt-2 font-semibold">
              {formatDate(course.startDate)}
            </p>
          </div>

          <div className="border-b p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-xs font-medium">
                End date
              </span>
            </div>

            <p className="mt-2 font-semibold">
              {formatDate(course.endDate)}
            </p>
          </div>

          <div className="border-b p-5 sm:border-r lg:border-b-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="size-4" />
              <span className="text-xs font-medium">
                Duration
              </span>
            </div>

            <p className="mt-2 font-semibold">
              {course.duration
                ? `${course.duration} days`
                : "Not specified"}
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="size-4" />
              <span className="text-xs font-medium">
                Enrolled
              </span>
            </div>

            <p className="mt-2 font-semibold">
              {formatDate(enrollment.enrolledAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming classes */}
        <section className="rounded-2xl border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />

                <h2 className="text-lg font-semibold">
                  Upcoming Classes
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Your next scheduled classes for this course.
              </p>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {upcomingSessions.length}
            </span>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                  <CalendarDays className="size-6 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-semibold">
                  No upcoming classes
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  There are no upcoming classes scheduled
                  right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {upcomingSessions.map((classSession) => (
                <div
                  key={classSession.id}
                  className="p-6 transition hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {classSession.title}
                      </h3>

                      {classSession.description && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {classSession.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4" />
                          {formatDateTime(
                            classSession.startTime,
                          )}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="size-4" />
                          {formatTime(
                            classSession.startTime,
                          )}{" "}
                          –{" "}
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

                    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Course progress */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />

            <h2 className="text-lg font-semibold">
              Your Progress
            </h2>
          </div>

          <div className="mt-7 flex justify-center">
            <div className="relative flex size-36 items-center justify-center rounded-full border-[10px] border-muted">
              <div className="absolute inset-[-10px] rounded-full border-[10px] border-primary border-r-transparent border-b-transparent -rotate-45" />

              <div className="text-center">
                <p className="text-3xl font-bold">
                  {progress}%
                </p>

                <p className="text-xs text-muted-foreground">
                  completed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Enrollment status
              </span>

              <span className="font-medium">
                {statusLabel(enrollment.status)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Enrolled on
              </span>

              <span className="font-medium">
                {formatDate(enrollment.enrolledAt)}
              </span>
            </div>

            {enrollment.completedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Completed on
                </span>

                <span className="font-medium">
                  {formatDate(enrollment.completedAt)}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Payment Status */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Payment Status
          </h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Your payment summary for this course.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Course Fee
            </p>

            <p className="mt-1 text-lg font-bold">
              ৳
              {courseFee.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Paid
            </p>

            <p className="mt-1 text-lg font-bold">
              ৳
              {paidAmount.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Remaining
            </p>

            <p className="mt-1 text-lg font-bold">
              ৳
              {remainingAmount.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* AI Personalization */}
      <AIPersonalizationCard
        courseId={course.id}
        personalization={aiPersonalization}
      />

      {/* Lessons */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Course Lessons
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Work through the published lessons in order.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {courseLessons.length}
          </span>
        </div>

        {courseLessons.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                <GraduationCap className="size-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No lessons available
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Published lessons for this course will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {courseLessons.map((lesson, index) => {
              const completed =
                lesson.progress?.completed ?? false;

              const isCurrent =
                !completed &&
                courseLessons.find(
                  (item) =>
                    !item.progress?.completed,
                )?.id === lesson.id;

              return (
                <Link
                  key={lesson.id}
                  href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                  className="group block p-5 transition hover:bg-muted/30 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        completed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <span className="text-sm font-bold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary">
                          {lesson.title}
                        </h3>

                        {completed && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            Completed
                          </span>
                        )}

                        {isCurrent && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            Continue
                          </span>
                        )}
                      </div>

                      {lesson.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {lesson.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          {lessonTypeLabel(lesson.type)}
                        </span>

                        {lesson.duration && (
                          <span>
                            {lesson.duration} min
                          </span>
                        )}

                        {lesson.progress?.lastViewedAt &&
                          !completed && (
                            <span>
                              Recently viewed
                            </span>
                          )}
                      </div>
                    </div>

                    <ArrowLeft className="size-4 shrink-0 rotate-180 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Assessments */}
      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Assessments
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Assessments currently available for this course.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {publishedAssessments.length}
          </span>
        </div>

        {publishedAssessments.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                <ClipboardCheck className="size-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No assessments available
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Published assessments for this course will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {publishedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="p-6 transition hover:bg-muted/30"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">
                        {assessment.title}
                      </h3>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        Available
                      </span>
                    </div>

                    {assessment.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {assessment.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span>
                        Marks:{" "}
                        {Number(assessment.totalMarks)}
                      </span>

                      <span>
                        Pass:{" "}
                        {Number(assessment.passingMarks)}
                      </span>

                      {assessment.duration !== null && (
                        <span>
                          Duration:{" "}
                          {assessment.duration} min
                        </span>
                      )}

                      {assessment.endDate && (
                        <span>
                          Ends:{" "}
                          {formatDateTime(
                            assessment.endDate,
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={`/student/assessments/${assessment.id}`}
                      className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Start Assessment
                    </Link>
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
