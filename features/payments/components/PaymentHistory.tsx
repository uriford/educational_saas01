"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Filter,
  Receipt,
  Search,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type PaymentStatus =
  | "PAID"
  | "PARTIALLY_PAID"
  | "UNPAID"
  | "OVERDUE";

type PaymentHistoryItem = {
  id: string;
  amount: unknown;
  paymentDate: Date;
  method: string;
  reference: string | null;
  notes: string | null;
  installment: {
    installmentNumber: number;
    amount: unknown;
    paymentPlan: {
      installments: {
        id: string;
        amount: unknown;
        paidAmount: unknown;
        dueDate: Date;
        status: string;
      }[];
      enrollment: {
        student: {
          id: string;
          studentId: string;
          firstName: string;
          lastName: string | null;
          email: string | null;
          phone: string | null;
          avatar: string | null;
        };
        course: {
          id: string;
          name: string;
          code: string;
        };
      };
    };
  };
};

function formatMoney(value: unknown) {
  return `৳${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMethod(method: string) {
  return method
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getPaymentStatus(
  transaction: PaymentHistoryItem,
): PaymentStatus {
  const installments =
    transaction.installment.paymentPlan.installments;

  const total = installments.reduce(
    (sum, installment) =>
      sum + Number(installment.amount || 0),
    0,
  );

  const paid = installments.reduce(
    (sum, installment) =>
      sum + Number(installment.paidAmount || 0),
    0,
  );

  const remaining = Math.max(total - paid, 0);

  if (remaining <= 0.01) {
    return "PAID";
  }

  if (paid <= 0) {
    const hasOverdue = installments.some(
      (installment) =>
        Number(installment.paidAmount || 0) <
          Number(installment.amount || 0) &&
        new Date(installment.dueDate) < new Date(),
    );

    return hasOverdue ? "OVERDUE" : "UNPAID";
  }

  const hasOverdue = installments.some(
    (installment) =>
      Number(installment.paidAmount || 0) <
        Number(installment.amount || 0) &&
      new Date(installment.dueDate) < new Date(),
  );

  return hasOverdue ? "OVERDUE" : "PARTIALLY_PAID";
}

function statusLabel(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PARTIALLY_PAID":
      return "Partially Paid";
    case "UNPAID":
      return "Unpaid";
    case "OVERDUE":
      return "Overdue";
  }
}

function StatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const classes = {
    PAID:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    PARTIALLY_PAID:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    UNPAID:
      "bg-muted text-muted-foreground",
    OVERDUE:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  const icons = {
    PAID: CheckCircle2,
    PARTIALLY_PAID: CreditCard,
    UNPAID: Receipt,
    OVERDUE: AlertCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}
    >
      <Icon className="size-3.5" />
      {statusLabel(status)}
    </span>
  );
}

export function PaymentHistory({
  transactions,
}: {
  transactions: PaymentHistoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | PaymentStatus>("ALL");
  const [methodFilter, setMethodFilter] =
    useState("ALL");

  const enrichedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        transaction,
        status: getPaymentStatus(transaction),
      })),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedTransactions.filter(
      ({ transaction, status }) => {
        const student =
          transaction.installment.paymentPlan.enrollment.student;

        const course =
          transaction.installment.paymentPlan.enrollment.course;

        const fullName = `${student.firstName} ${student.lastName ?? ""}`
          .replace(/\\s+/g, " ")
          .trim();

        const normalizedQuery = query.replace(/\\s+/g, " ").trim();

        const matchesSearch =
          !normalizedQuery ||
          [
            fullName,
            student.studentId,
            student.firstName,
            student.lastName,
            student.email,
            student.phone,
            course.name,
            course.code,
            transaction.reference,
            transaction.method,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(normalizedQuery),
            );

        const matchesStatus =
          statusFilter === "ALL" ||
          status === statusFilter;

        const matchesMethod =
          methodFilter === "ALL" ||
          transaction.method === methodFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesMethod
        );
      },
    );
  }, [
    enrichedTransactions,
    search,
    statusFilter,
    methodFilter,
  ]);

  const summary = useMemo(() => {
    const uniqueStudents = new Map<
      string,
      PaymentStatus
    >();

    for (const {
      transaction,
      status,
    } of enrichedTransactions) {
      const studentId =
        transaction.installment.paymentPlan.enrollment
          .student.id;

      const existing = uniqueStudents.get(studentId);

      if (!existing) {
        uniqueStudents.set(studentId, status);
        continue;
      }

      if (
        status === "OVERDUE" ||
        (status === "PARTIALLY_PAID" &&
          existing === "PAID") ||
        (status === "UNPAID" &&
          existing === "PAID")
      ) {
        uniqueStudents.set(studentId, status);
      }
    }

    const totalCollected = transactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0,
    );

    return {
      totalTransactions: transactions.length,
      totalCollected,
      paidStudents: [...uniqueStudents.values()].filter(
        (status) => status === "PAID",
      ).length,
      partialStudents: [
        ...uniqueStudents.values(),
      ].filter(
        (status) => status === "PARTIALLY_PAID",
      ).length,
      unpaidStudents: [...uniqueStudents.values()].filter(
        (status) => status === "UNPAID",
      ).length,
      overdueStudents: [...uniqueStudents.values()].filter(
        (status) => status === "OVERDUE",
      ).length,
    };
  }, [enrichedTransactions, transactions]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    methodFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Receipt className="size-6" />
          <h1 className="text-2xl font-bold tracking-tight">
            Payment History
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          View and filter recorded payment transactions for
          your organization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Transactions"
          value={summary.totalTransactions}
          icon={Receipt}
        />

        <SummaryCard
          label="Collected"
          value={formatMoney(
            summary.totalCollected,
          )}
          icon={CreditCard}
        />

        <SummaryCard
          label="Paid Students"
          value={summary.paidStudents}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Overdue Students"
          value={summary.overdueStudents}
          icon={AlertCircle}
          danger={summary.overdueStudents > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniSummary
          label="Partially Paid"
          value={summary.partialStudents}
        />

        <MiniSummary
          label="Unpaid"
          value={summary.unpaidStudents}
        />

        <MiniSummary
          label="Overdue"
          value={summary.overdueStudents}
          danger={summary.overdueStudents > 0}
        />
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search student, ID, course, reference..."
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "ALL"
                        | PaymentStatus,
                    )
                  }
                  className="h-10 w-full min-w-44 appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ALL">
                    All statuses
                  </option>
                  <option value="PAID">
                    Paid
                  </option>
                  <option value="PARTIALLY_PAID">
                    Partially Paid
                  </option>
                  <option value="UNPAID">
                    Unpaid
                  </option>
                  <option value="OVERDUE">
                    Overdue
                  </option>
                </select>
              </div>

              <select
                value={methodFilter}
                onChange={(event) =>
                  setMethodFilter(event.target.value)
                }
                className="h-10 min-w-44 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">
                  All methods
                </option>
                <option value="CASH">
                  Cash
                </option>
                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>
                <option value="MOBILE_BANKING">
                  Mobile Banking
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                >
                  <X className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
            <Receipt className="mb-3 size-10 text-muted-foreground" />

            <h2 className="font-semibold">
              {hasFilters
                ? "No matching payments"
                : "No payment history yet"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try changing your search or filters."
                : "Recorded payments will appear here."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Course
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Installment
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Method
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Reference
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Payment Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map(
                  ({ transaction, status }) => {
                    const student =
                      transaction.installment
                        .paymentPlan.enrollment
                        .student;

                    const course =
                      transaction.installment
                        .paymentPlan.enrollment
                        .course;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                              <User className="size-4 text-muted-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">
                                {student.firstName}{" "}
                                {student.lastName}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {student.studentId}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium">
                            {course.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {course.code}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            #
                            {
                              transaction.installment
                                .installmentNumber
                            }
                          </span>
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {formatMoney(
                            transaction.amount,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {formatMethod(
                            transaction.method,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {transaction.reference ? (
                            <div className="flex items-center gap-1.5">
                              <FileText className="size-3.5 text-muted-foreground" />

                              <span className="font-mono text-xs">
                                {transaction.reference}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-muted-foreground" />

                            {formatDate(
                              transaction.paymentDate,
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredTransactions.length} of{" "}
        {transactions.length} payment transactions.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: string | number;
  icon: typeof Receipt;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
          <Icon
            className={`size-4 ${
              danger
                ? "text-red-500"
                : "text-muted-foreground"
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

function MiniSummary({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {label}
        </span>

        <span
          className={`text-lg font-semibold ${
            danger ? "text-red-600" : ""
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
