import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ROLES } from "@/features/auth/roles";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import EnrollCourseButton from "@/features/student-portal/components/explore-courses/EnrollCourseButton";

function formatPrice(price: unknown) {
  if (price === null || price === undefined) {
    return "Contact for price";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export default async function ExploreCourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  const { courseId } = await params;

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });


  const course = await db.course.findFirst({
    where: {
      id: courseId,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      enrollments: student
        ? {
            where: {
              studentId: student.id,
            },
            select: {
              id: true,
              status: true,
              progress: true,
              enrolledAt: true,
            },
          }
        : {
            where: {
              id: "00000000-0000-0000-0000-000000000000",
            },
            select: {
              id: true,
              status: true,
              progress: true,
              enrolledAt: true,
            },
          },
    },
  });

  if (!course) {
    notFound();
  }

  const enrollment = course.enrollments[0] ?? null;
  const enrolled = Boolean(enrollment);

  const pendingRequest = student
    ? await db.enrollmentRequest.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/student/explore-courses">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Back to Explore Courses
        </Button>
      </Link>

      <Card className="overflow-hidden">
        <div className="flex min-h-56 items-center justify-center bg-primary/5">
          <BookOpen className="size-20 text-primary/50" />
        </div>

        <CardContent className="p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {course.code}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {course.name}
          </h1>

          <p className="mt-5 max-w-3xl text-muted-foreground">
            {course.description ||
              "Explore this course and learn more about what you will study."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {course.duration !== null && (
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Duration
                </p>
                <p className="mt-1 font-semibold">
                  {course.duration} days
                </p>
              </div>
            )}

            {course.startDate && (
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Starts
                </p>
                <p className="mt-1 font-semibold">
                  {new Intl.DateTimeFormat("en-BD", {
                    dateStyle: "medium",
                  }).format(course.startDate)}
                </p>
              </div>
            )}

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                Course Fee
              </p>
              <p className="mt-1 font-semibold">
                {formatPrice(course.fee)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Enrollment
              </p>

              {enrolled ? (
                <>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                    <CheckCircle2 className="size-5 text-green-600" />
                    You are already enrolled
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Progress: {enrollment?.progress ?? 0}%
                  </p>
                </>
              ) : pendingRequest ? (
                <>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold text-amber-600">
                    <CheckCircle2 className="size-5" />
                    Approval Pending
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your enrollment request has been submitted.
                    Waiting for administrator approval.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-3xl font-bold">
                    {formatPrice(course.fee)}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Enroll now to join this course.
                  </p>
                </>
              )}
            </div>

            {enrolled ? (
              <Link href={`/student/courses/${course.id}`}>
                <Button size="lg">
                  <CheckCircle2 className="mr-2 size-5" />
                  Go to My Course
                </Button>
              </Link>
            ) : pendingRequest ? (
              <Button size="lg" disabled>
                Request Submitted
              </Button>
            ) : (
              <EnrollCourseButton courseId={course.id} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
