import { CreditCard, Receipt, Wallet } from "lucide-react";

import { getMyPaymentHistoryAction } from "@/features/payments/actions/get-my-payment-history.action";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";

export default async function StudentPaymentsPage() {
  const history = await getMyPaymentHistoryAction();

  const plans = history.reduce<
    Map<
      string,
      {
        id: string;
        totalAmount: number;
        status: string;
        courseName: string;
        courseCode: string;
      }
    >
  >((map, transaction) => {
    const plan = transaction.installment.paymentPlan;

    if (!map.has(plan.id)) {
      map.set(plan.id, {
        id: plan.id,
        totalAmount: Number(plan.totalAmount),
        status: plan.status,
        courseName: plan.enrollment.course.name,
        courseCode: plan.enrollment.course.code,
      });
    }

    return map;
  }, new Map());

  const totalPaid = history.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  const totalTransactions = history.length;

  const outstanding = Array.from(plans.values()).reduce(
    (sum, plan) => {
      const planPaid = history
        .filter(
          (transaction) =>
            transaction.installment.paymentPlan.id === plan.id,
        )
        .reduce(
          (paid, transaction) =>
            paid + Number(transaction.amount),
          0,
        );

      return sum + Math.max(plan.totalAmount - planPaid, 0);
    },
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              View your payment plans, balances, and payment history.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Paid
              </p>
              <p className="mt-1 text-2xl font-bold">
                ৳
                {totalPaid.toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <Wallet className="size-7 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Outstanding
              </p>
              <p className="mt-1 text-2xl font-bold">
                ৳
                {outstanding.toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <CreditCard className="size-7 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Transactions
              </p>
              <p className="mt-1 text-2xl font-bold">
                {totalTransactions}
              </p>
            </div>

            <Receipt className="size-7 text-muted-foreground" />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Payment Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Your payment plans and current balances.
          </p>
        </div>

        {plans.size === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <CreditCard className="mx-auto size-10 text-muted-foreground" />

            <h3 className="mt-3 font-semibold">
              No payment plans yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Your payment information will appear here when a payment
              plan is created for one of your courses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from(plans.values()).map((plan) => {
              const paid = history
                .filter(
                  (transaction) =>
                    transaction.installment.paymentPlan.id ===
                    plan.id,
                )
                .reduce(
                  (sum, transaction) =>
                    sum + Number(transaction.amount),
                  0,
                );

              const balance = Math.max(
                plan.totalAmount - paid,
                0,
              );

              return (
                <div
                  key={plan.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {plan.courseName}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {plan.courseCode}
                      </p>
                    </div>

                    <PaymentStatusBadge
                      status={
                        plan.status as
                          | "ACTIVE"
                          | "PAID"
                          | "FINALIZED"
                      }
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Plan Amount
                      </p>
                      <p className="mt-1 font-semibold">
                        ৳
                        {plan.totalAmount.toLocaleString("en-BD", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Remaining
                      </p>
                      <p className="mt-1 font-semibold">
                        ৳
                        {balance.toLocaleString("en-BD", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Payment progress
                      </span>
                      <span className="font-medium">
                        {plan.totalAmount > 0
                          ? Math.min(
                              Math.round(
                                (paid / plan.totalAmount) * 100,
                              ),
                              100,
                            )
                          : 0}
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${
                            plan.totalAmount > 0
                              ? Math.min(
                                  (paid / plan.totalAmount) * 100,
                                  100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Payment History
          </h2>

          <p className="text-sm text-muted-foreground">
            Your recorded payment transactions.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <Receipt className="mx-auto size-10 text-muted-foreground" />

            <h3 className="mt-3 font-semibold">
              No payment history
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Your payment transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-5 py-3 font-medium">
                      Course
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Installment
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Method
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Reference
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {
                            transaction.installment.paymentPlan
                              .enrollment.course.name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            transaction.installment.paymentPlan
                              .enrollment.course.code
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        #
                        {
                          transaction.installment
                            .installmentNumber
                        }
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        ৳
                        {Number(
                          transaction.amount,
                        ).toLocaleString("en-BD", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-4">
                        {transaction.method
                          .toLowerCase()
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1),
                          )
                          .join(" ")}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs">
                        {transaction.reference || "—"}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {new Intl.DateTimeFormat("en-BD", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(
                          new Date(transaction.paymentDate),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
