import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

export default async function GuardianProgressPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const { studentId } = await searchParams;

  const children = await GuardianService.getChildren(
    session.user.id,
    session.user.organizationId,
  );

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Learning Progress
        </h1>

        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No children linked</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No students are currently linked to your guardian account.
          </p>
        </div>
      </div>
    );
  }

  const selectedStudentId =
    studentId &&
    children.some(({ student }) => student.id === studentId)
      ? studentId
      : children[0].student.id;

  const progress = await GuardianService.getChildProgress(
    session.user.id,
    session.user.organizationId,
    selectedStudentId,
  );

  if (!progress) {
    redirect("/guardian/progress");
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Learning Progress
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your child&apos;s lesson completion and course progress.
        </p>
      </section>

      {children.length > 1 && (
        <section className="rounded-xl border bg-background p-5">
          <p className="mb-3 text-sm font-medium">Select child</p>

          <div className="flex flex-wrap gap-2">
            {children.map(({ student }) => {
              const name =
                `${student.firstName} ${student.lastName ?? ""}`.trim();

              const active = student.id === selectedStudentId;

              return (
                <a
                  key={student.id}
                  href={`/guardian/progress?studentId=${student.id}`}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  {name}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-background p-5">
        <p className="text-sm text-muted-foreground">Student</p>
        <h2 className="mt-1 text-lg font-semibold">
          {progress.student.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          ID: {progress.student.studentId}
        </p>
      </section>

      {progress.courses.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No active courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This student has no active or completed course enrollments.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {progress.courses.map((course) => (
            <section
              key={course.enrollmentId}
              className="rounded-xl border bg-background"
            >
              <div className="border-b p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {course.course.name}
                    </h2>

                    {course.course.code && (
                      <p className="text-sm text-muted-foreground">
                        {course.course.code}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {course.progress}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.completedLessons} of {course.totalLessons}{" "}
                      lessons
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="divide-y">
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{lesson.title}</p>

                      <p className="text-xs text-muted-foreground">
                        {lesson.type}
                        {lesson.lastViewedAt
                          ? " · Viewed"
                          : " · Not viewed"}
                      </p>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                        lesson.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {lesson.completed ? "Completed" : "Incomplete"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
