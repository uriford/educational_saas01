import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

function money(value: unknown) {
  return `৳${Number(value ?? 0).toLocaleString("en-BD")}`;
}

function date(value: Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

export default async function GuardianPaymentsPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

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

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight">
            Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your children&apos;s payment plans and payment status.
          </p>
        </section>

        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No children linked</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No students are currently linked to your guardian account.
          </p>
        </div>
      </div>
    );
  }

  const { studentId } = await searchParams;

  const selectedStudent =
    children.find(({ student }) => student.id === studentId)?.student ??
    children[0].student;

  const plans = await GuardianService.getChildPayments(
    session.user.id,
    session.user.organizationId,
    selectedStudent.id,
  );

  const total = plans?.reduce(
    (sum, plan) => sum + Number(plan.totalAmount),
    0,
  ) ?? 0;

  const paid = plans?.reduce(
    (sum, plan) =>
      sum +
      plan.installments.reduce(
        (installmentSum, installment) =>
          installmentSum + Number(installment.paidAmount),
        0,
      ),
    0,
  ) ?? 0;

  const outstanding = Math.max(total - paid, 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Payments
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View payment information for {selectedStudent.firstName}{" "}
          {selectedStudent.lastName ?? ""}.
        </p>
      </section>

      {children.length > 1 && (
        <section className="rounded-xl border bg-background p-5">
          <p className="mb-3 text-sm font-medium">Select child</p>

          <div className="flex flex-wrap gap-2">
            {children.map(({ student }) => (
              <a
                key={student.id}
                href={`/guardian/payments?studentId=${student.id}`}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-medium",
                  student.id === selectedStudent.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                ].join(" ")}
              >
                {student.firstName} {student.lastName ?? ""}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-bold">{money(total)}</p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {money(paid)}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="mt-2 text-2xl font-bold">
            {money(outstanding)}
          </p>
        </div>
      </section>

      {!plans || plans.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No payment plans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No payment plans have been created for this student yet.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-background"
            >
              <div className="border-b p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {plan.enrollment.course.name}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {plan.enrollment.course.code ?? ""}
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {plan.status}
                  </span>
                </div>
              </div>

              <div className="divide-y">
                {plan.installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        Installment
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Due {date(installment.dueDate)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Amount
                        </p>
                        <p className="font-semibold">
                          {money(installment.amount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Paid
                        </p>
                        <p className="font-semibold">
                          {money(installment.paidAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Status
                        </p>
                        <p className="font-semibold">
                          {installment.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
