"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  AlertCircle,
  History,
} from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type Plan = {
  id: string;
  totalAmount: unknown;
  status: "ACTIVE" | "PAID" | "FINALIZED";
  enrollment: {
    student: {
      id: string;
      studentId: string;
      firstName: string;
      lastName: string | null;
      email: string | null;
      phone: string | null;
    };
    course: {
      id: string;
      name: string;
      code: string;
    };
  };
  installments: {
    id: string;
    installmentNumber: number;
    amount: unknown;
    paidAmount: unknown;
    dueDate: Date;
    status:
      | "UPCOMING"
      | "DUE"
      | "OVERDUE"
      | "PARTIALLY_PAID"
      | "PAID";
  }[];
};

function money(value: unknown) {
  return `৳${Number(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

function date(value: Date) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PaymentOverview({
  plans,
}: {
  plans: Plan[];
}) {
  const total = plans.reduce(
    (sum, plan) => sum + Number(plan.totalAmount),
    0,
  );

  const paid = plans.reduce(
    (sum, plan) =>
      sum +
      plan.installments.reduce(
        (inner, installment) =>
          inner + Number(installment.paidAmount),
        0,
      ),
    0,
  );

  const outstanding = Math.max(total - paid, 0);

  const overdue = plans.reduce(
    (sum, plan) =>
      sum +
      plan.installments
        .filter((i) => i.status === "OVERDUE")
        .reduce(
          (inner, i) =>
            inner +
            Math.max(
              Number(i.amount) - Number(i.paidAmount),
              0,
            ),
          0,
        ),
    0,
  );

  const dueToday = plans.reduce(
    (sum, plan) =>
      sum +
      plan.installments
        .filter((i) => i.status === "DUE")
        .reduce(
          (inner, i) =>
            inner +
            Math.max(
              Number(i.amount) - Number(i.paidAmount),
              0,
            ),
          0,
        ),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
            <CreditCard className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage student fees, installments and payment history.
            </p>
          </div>
        </div>

        <Link
          href="/payments/history"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <History className="size-4" />
          Payment History
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assigned"
          value={money(total)}
          icon={CircleDollarSign}
        />

        <StatCard
          title="Collected"
          value={money(paid)}
          icon={CheckCircle2}
        />

        <StatCard
          title="Outstanding"
          value={money(outstanding)}
          icon={Clock3}
        />

        <StatCard
          title="Overdue"
          value={money(overdue)}
          icon={AlertCircle}
          danger={overdue > 0}
        />
      </div>

      {dueToday > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/30">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
            <CalendarClock className="size-5 text-orange-600" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-orange-900 dark:text-orange-200">
              Payments due today
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {money(dueToday)} is scheduled to be received today.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="font-semibold">
              Student Payment Plans
            </h2>
            <p className="text-sm text-muted-foreground">
              {plans.length} payment plan{plans.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <CreditCard className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">
              No payment plans yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Payment plans will appear here when you assign a fee
              schedule to a student enrollment.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {plans.map((plan) => {
              const student = plan.enrollment.student;
              const studentName = `${student.firstName} ${
                student.lastName ?? ""
              }`.trim();

              const planPaid = plan.installments.reduce(
                (sum, item) =>
                  sum + Number(item.paidAmount),
                0,
              );

              const remaining = Math.max(
                Number(plan.totalAmount) - planPaid,
                0,
              );

              const next = plan.installments.find(
                (item) => item.status !== "PAID",
              );

              const progress =
                Number(plan.totalAmount) > 0
                  ? Math.min(
                      (planPaid / Number(plan.totalAmount)) * 100,
                      100,
                    )
                  : 0;

              return (
                <div
                  key={plan.id}
                  className="group p-6 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="font-semibold">
                            {studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.studentId}
                          </p>
                        </div>

                        <PaymentStatusBadge
                          status={plan.status}
                        />
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        {plan.enrollment.course.name}
                        {" · "}
                        {plan.enrollment.course.code}
                      </p>

                      <div className="mt-4 max-w-xl">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {money(planPaid)} paid
                          </span>
                          <span className="font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Remaining
                        </p>
                        <p className="text-lg font-semibold">
                          {money(remaining)}
                        </p>

                        {next && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {money(
                              Math.max(
                                Number(next.amount) -
                                  Number(next.paidAmount),
                                0,
                              ),
                            )}{" "}
                            · {date(next.dueDate)}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/students/${student.id}`}
                        className="flex size-10 items-center justify-center rounded-xl border opacity-70 transition group-hover:opacity-100 hover:bg-muted"
                      >
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  danger = false,
}: {
  title: string;
  value: string;
  icon: typeof CircleDollarSign;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
          <Icon
            className={`size-4 ${
              danger ? "text-red-500" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
