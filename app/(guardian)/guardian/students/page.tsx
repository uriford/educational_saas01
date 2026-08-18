import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default async function GuardianStudentsPage() {
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

  const children = await GuardianService.getChildren(
    session.user.id,
    session.user.organizationId,
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          My Students
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View the students linked to your guardian account.
        </p>
      </section>

      {children.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">
            No students linked
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Please contact the organization administrator if a
            student should be linked to your account.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {children.map(({ student }) => {
            const fullName =
              `${student.firstName} ${student.lastName ?? ""}`.trim();

            return (
              <article
                key={student.id}
                className="rounded-xl border bg-background p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">
                      {fullName}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Student ID: {student.studentId}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {student.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Admission
                    </span>

                    <span className="font-medium">
                      {formatDate(student.admissionDate)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Date of Birth
                    </span>

                    <span className="font-medium">
                      {formatDate(student.dateOfBirth)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Phone
                    </span>

                    <span className="font-medium">
                      {student.phone ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href={`/guardian/children/${student.id}`}
                    className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                  >
                    Profile
                  </Link>

                  <Link
                    href={`/guardian/attendance?studentId=${student.id}`}
                    className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Attendance
                  </Link>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href={`/guardian/results?studentId=${student.id}`}
                    className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                  >
                    Results
                  </Link>

                  <Link
                    href={`/guardian/payments?studentId=${student.id}`}
                    className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                  >
                    Payments
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
