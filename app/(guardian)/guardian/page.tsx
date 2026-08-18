import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

export default async function GuardianDashboardPage() {
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

  const firstName = session.user.name?.split(" ")[0] ?? "Guardian";

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {firstName}
        </h1>

        <p className="mt-1 text-muted-foreground">
          Monitor your children&apos;s academic progress, attendance,
          results, and payments.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            My Children
          </p>

          <p className="mt-2 text-3xl font-bold">
            {children.length}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Active Children
          </p>

          <p className="mt-2 text-3xl font-bold">
            {children.filter(
              ({ student }) => student.status === "ACTIVE",
            ).length}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Graduated
          </p>

          <p className="mt-2 text-3xl font-bold">
            {children.filter(
              ({ student }) => student.status === "GRADUATED",
            ).length}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Portal Status
          </p>

          <p className="mt-2 text-lg font-semibold text-green-600">
            Active
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            My Children
          </h2>

          <p className="text-sm text-muted-foreground">
            Select a child to view their academic information.
          </p>
        </div>

        {children.length === 0 ? (
          <div className="rounded-xl border bg-background p-10 text-center">
            <h3 className="font-semibold">
              No children linked yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Please contact the organization administrator to
              link a student to your guardian account.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {children.map(({ student }) => {
              const fullName =
                `${student.firstName} ${student.lastName ?? ""}`.trim();

              return (
                <div
                  key={student.id}
                  className="rounded-xl border bg-background p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {fullName}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        ID: {student.studentId}
                      </p>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {student.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Relationship
                      </span>

                      <span className="font-medium">
                        Guardian
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Phone
                      </span>

                      <span className="font-medium">
                        {student.phone ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                      href={`/guardian/children/${student.id}`}
                      className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-muted"
                    >
                      View Profile
                    </a>

                    <a
                      href={`/guardian/results?studentId=${student.id}`}
                      className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Results
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
