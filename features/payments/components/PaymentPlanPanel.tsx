"use client";

import { useState, useTransition } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LockKeyhole,
  Plus,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";

import { recordPaymentAction } from "../actions/record-payment.action";
import { finalizePaymentPlanAction } from "../actions/finalize-payment-plan.action";
import CreatePaymentPlanDialog from "./CreatePaymentPlanDialog";

type Installment = {
  id: string;
  installmentNumber: number;
  amount: unknown;
  paidAmount: unknown;
  dueDate: Date | string;
  status: string;
  paidAt: Date | string | null;
  notes: string | null;
  transactions?: {
    id: string;
    amount: unknown;
    paymentDate: Date | string;
    method: string | null;
    reference: string | null;
    notes: string | null;
  }[];
};

type Plan = {
  id: string;
  enrollmentId: string;
  totalAmount: unknown;
  status: string;
  finalizedAt: Date | string | null;
  installments: Installment[];
  enrollment: {
    course: {
      id: string;
      name: string;
      code: string;
    };
  };
};

type Enrollment = {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
    fee: unknown;
  };
};

type Props = {
  plan: Plan | null;
  enrollments?: Enrollment[];
};

function money(value: unknown) {
  return Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function date(value: Date | string) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PaymentPlanPanel({
  plan,
  enrollments = [],
}: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!plan) {
    return (
      <>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <CircleDollarSign className="size-6 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold">
                  No Payment Plan
                </h3>

                <p className="text-sm text-muted-foreground">
                  No financial schedule has been created for this student yet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              disabled={enrollments.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
              Create Payment Plan
            </button>
          </div>

          {enrollments.length === 0 && (
            <div className="border-t bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
              The student must be enrolled in a course before a payment plan can be created.
            </div>
          )}
        </div>

        {showCreate && (
          <CreatePaymentPlanDialog
            enrollments={enrollments}
            onClose={() => setShowCreate(false)}
          />
        )}
      </>
    );
  }

  const paymentPlan = plan;

  const total = Number(paymentPlan.totalAmount);
  const paid = paymentPlan.installments.reduce(
    (sum, item) => sum + Number(item.paidAmount),
    0,
  );
  const remaining = Math.max(total - paid, 0);
  const percentage =
    total > 0 ? Math.min((paid / total) * 100, 100) : 0;

  const finalized = paymentPlan.status === "FINALIZED";
  const fullyPaid =
    remaining <= 0.01 ||
    paymentPlan.status === "PAID";

  function recordPayment(installmentId: string) {
    const installment = paymentPlan.installments.find(
      (item) => item.id === installmentId,
    );

    if (!installment) return;

    const outstanding =
      Number(installment.amount) -
      Number(installment.paidAmount);

    const amount = window.prompt(
      `Enter payment amount. Remaining: ৳${money(outstanding)}`,
    );

    if (!amount) return;

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    const methodInput =
      window.prompt(
        "Payment method: CASH, BANK_TRANSFER, MOBILE_BANKING, or OTHER",
        "CASH",
      );

    if (!methodInput) return;

    const normalizedMethod = methodInput
      .trim()
      .toUpperCase();

    const method =
      normalizedMethod === "CASH" ||
      normalizedMethod === "BANK_TRANSFER" ||
      normalizedMethod === "MOBILE_BANKING" ||
      normalizedMethod === "OTHER"
        ? normalizedMethod
        : null;

    if (!method) {
      toast.error(
        "Invalid payment method. Use CASH, BANK_TRANSFER, MOBILE_BANKING, or OTHER.",
      );
      return;
    }

    startTransition(async () => {
      try {
        await recordPaymentAction({
          installmentId,
          amount: numericAmount,
          paymentDate: new Date(),
          method,
        });

        toast.success("Payment recorded successfully.");
        window.location.reload();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to record payment.",
        );
      }
    });
  }

  function finalizePlan() {
    if (!fullyPaid) {
      toast.error(
        "The payment plan still has an outstanding balance.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Finalize this payment record? Once finalized, it will become permanently read-only.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await finalizePaymentPlanAction(paymentPlan.id);

        toast.success(
          "Payment record finalized and locked.",
        );

        window.location.reload();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to finalize payment plan.",
        );
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-gradient-to-br from-primary/5 via-background to-background p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CircleDollarSign className="size-6 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {paymentPlan.enrollment.course.name}
                </h3>

                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {paymentPlan.enrollment.course.code}
                </span>

                {finalized && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <LockKeyhole className="size-3" />
                    Read-only
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Payment history and scheduled installments
              </p>
            </div>
          </div>

          {fullyPaid && !finalized && (
            <button
              type="button"
              disabled={isPending}
              onClick={finalizePlan}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <LockKeyhole className="size-4" />
              Finalize & Lock
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs text-muted-foreground">
              Total Fee
            </p>
            <p className="mt-1 text-xl font-bold">
              ৳{money(total)}
            </p>
          </div>

          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs text-muted-foreground">
              Paid
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-600">
              ৳{money(paid)}
            </p>
          </div>

          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs text-muted-foreground">
              Remaining
            </p>
            <p className="mt-1 text-xl font-bold text-orange-600">
              ৳{money(remaining)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted-foreground">
              Payment progress
            </span>

            <span className="font-semibold">
              {Math.round(percentage)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y">
        {paymentPlan.installments.map((installment) => {
          const installmentAmount = Number(
            installment.amount,
          );
          const installmentPaid = Number(
            installment.paidAmount,
          );
          const installmentRemaining = Math.max(
            installmentAmount - installmentPaid,
            0,
          );

          const isPaid =
            installment.status === "PAID";

          const isPartial =
            installment.status === "PARTIALLY_PAID";

          const isOverdue =
            !isPaid &&
            new Date(installment.dueDate) <
              new Date();

          return (
            <div
              key={installment.id}
              className="p-5 transition hover:bg-muted/20"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      isPaid
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950"
                        : isOverdue
                          ? "bg-red-100 text-red-600 dark:bg-red-950"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="size-5" />
                    ) : isOverdue ? (
                      <Clock3 className="size-5" />
                    ) : (
                      <CalendarDays className="size-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">
                        Installment{" "}
                        {installment.installmentNumber}
                      </h4>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : isPartial
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : isOverdue
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        }`}
                      >
                        {isPaid
                          ? "PAID"
                          : isPartial
                            ? "PARTIALLY PAID"
                            : isOverdue
                              ? "OVERDUE"
                              : "UPCOMING"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Due {date(installment.dueDate)}
                    </p>

                    {installment.notes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {installment.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <p className="font-semibold">
                    ৳{money(installmentAmount)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Paid ৳{money(installmentPaid)}
                  </p>

                  {!isPaid && (
                    <p className="text-xs font-medium text-orange-600">
                      ৳{money(installmentRemaining)} remaining
                    </p>
                  )}
                </div>
              </div>

              {installment.transactions &&
                installment.transactions.length > 0 && (
                  <div className="mt-4 rounded-xl bg-muted/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                      <ReceiptText className="size-3.5" />
                      Payment History
                    </div>

                    <div className="space-y-2">
                      {installment.transactions.map(
                        (transaction) => (
                          <div
                            key={transaction.id}
                            className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <span className="font-medium">
                                ৳{money(transaction.amount)}
                              </span>

                              <span className="ml-2 text-muted-foreground">
                                {transaction.method ||
                                  "Payment"}
                              </span>
                            </div>

                            <span className="text-muted-foreground">
                              {date(
                                transaction.paymentDate,
                              )}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {!finalized && !isPaid && (
                <div className="mt-4">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      recordPayment(installment.id)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    <ReceiptText className="size-3.5" />
                    Record Payment
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {finalized && (
        <div className="flex items-start gap-3 border-t bg-muted/30 p-5">
          <LockKeyhole className="mt-0.5 size-5 text-muted-foreground" />

          <div>
            <p className="text-sm font-semibold">
              Financial record finalized
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              This payment record is permanently read-only.
              {paymentPlan.finalizedAt
                ? ` Finalized on ${date(paymentPlan.finalizedAt)}.`
                : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPlanPanel;
