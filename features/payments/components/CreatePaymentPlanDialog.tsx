"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createPaymentPlanAction } from "../actions/create-payment-plan.action";

type Enrollment = {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
    fee: unknown;
  };
};

type Installment = {
  amount: string;
  dueDate: string;
  notes: string;
};

type Props = {
  enrollments: Enrollment[];
  onClose: () => void;
};

export default function CreatePaymentPlanDialog({
  enrollments,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [enrollmentId, setEnrollmentId] = useState(
    enrollments[0]?.id ?? "",
  );

  const selectedEnrollment = enrollments.find(
    (item) => item.id === enrollmentId,
  );

  const [totalAmount, setTotalAmount] = useState(
    selectedEnrollment?.course.fee
      ? String(Number(selectedEnrollment.course.fee))
      : "",
  );

  const [installments, setInstallments] = useState<
    Installment[]
  >([
    {
      amount: "",
      dueDate: new Date()
        .toISOString()
        .split("T")[0],
      notes: "",
    },
  ]);

  const allocated = useMemo(
    () =>
      installments.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      ),
    [installments],
  );

  const total = Number(totalAmount) || 0;

  const remaining = total - allocated;

  const isValid =
    Boolean(enrollmentId) &&
    total > 0 &&
    installments.length > 0 &&
    Math.abs(remaining) < 0.01 &&
    installments.every(
      (item) =>
        Number(item.amount) > 0 &&
        Boolean(item.dueDate),
    );

  function addInstallment() {
    setInstallments((current) => [
      ...current,
      {
        amount: "",
        dueDate: new Date()
          .toISOString()
          .split("T")[0],
        notes: "",
      },
    ]);
  }

  function removeInstallment(index: number) {
    setInstallments((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  function updateInstallment(
    index: number,
    field: keyof Installment,
    value: string,
  ) {
    setInstallments((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleEnrollmentChange(value: string) {
    setEnrollmentId(value);

    const enrollment = enrollments.find(
      (item) => item.id === value,
    );

    if (enrollment?.course.fee) {
      setTotalAmount(
        String(Number(enrollment.course.fee)),
      );
    }
  }

  function submit() {
    if (!isValid) {
      if (remaining > 0) {
        toast.error(
          `৳${remaining.toLocaleString()} is still unallocated.`,
        );
      } else if (remaining < 0) {
        toast.error(
          `Installments exceed the total by ৳${Math.abs(
            remaining,
          ).toLocaleString()}.`,
        );
      } else {
        toast.error(
          "Please complete all payment plan fields.",
        );
      }

      return;
    }

    startTransition(async () => {
      try {
        await createPaymentPlanAction({
          enrollmentId,
          totalAmount: total,
          installments: installments.map((item) => ({
            amount: Number(item.amount),
            dueDate: new Date(
              `${item.dueDate}T00:00:00`,
            ),
            notes: item.notes || undefined,
          })),
        });

        toast.success(
          "Payment plan created successfully.",
        );

        onClose();
        window.location.reload();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to create payment plan.",
        );
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b p-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <CircleDollarSign className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Create Payment Plan
                </h2>

                <p className="text-sm text-muted-foreground">
                  Set up a payment schedule for this student.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {enrollments.length === 0 ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-700">
              This student has no active course enrollment.
              Enroll the student in a course first.
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Course Enrollment
                </label>

                <select
                  value={enrollmentId}
                  onChange={(e) =>
                    handleEnrollmentChange(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {enrollments.map((enrollment) => (
                    <option
                      key={enrollment.id}
                      value={enrollment.id}
                    >
                      {enrollment.course.name} (
                      {enrollment.course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Total Course Fee
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) =>
                      setTotalAmount(e.target.value)
                    }
                    className="w-full rounded-xl border bg-background py-3 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="30000"
                  />
                </div>

                {selectedEnrollment?.course.fee != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Course fee:{" "}
                    {`৳${Number(
                      selectedEnrollment.course.fee,
                    ).toLocaleString()}`}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Installments
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Divide the total fee into scheduled
                      payments.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addInstallment}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                    Add Installment
                  </button>
                </div>

                <div className="space-y-3">
                  {installments.map(
                    (installment, index) => (
                      <div
                        key={index}
                        className="rounded-xl border bg-muted/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Installment {index + 1}
                          </span>

                          {installments.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeInstallment(
                                  index,
                                )
                              }
                              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium">
                              Amount
                            </label>

                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                ৳
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  installment.amount
                                }
                                onChange={(e) =>
                                  updateInstallment(
                                    index,
                                    "amount",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-lg border bg-background py-2.5 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="10000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium">
                              Due Date
                            </label>

                            <div className="relative">
                              <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                              <input
                                type="date"
                                value={
                                  installment.dueDate
                                }
                                onChange={(e) =>
                                  updateInstallment(
                                    index,
                                    "dueDate",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-medium">
                            Notes
                          </label>

                          <input
                            value={installment.notes}
                            onChange={(e) =>
                              updateInstallment(
                                index,
                                "notes",
                                e.target.value,
                              )
                            }
                            placeholder="Optional note..."
                            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  Math.abs(remaining) < 0.01
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                    : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                }`}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Fee
                  </span>

                  <span className="font-medium">
                    ৳{total.toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Allocated
                  </span>

                  <span className="font-medium">
                    ৳{allocated.toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {remaining === 0
                        ? "Fully allocated"
                        : remaining > 0
                          ? "Remaining"
                          : "Over allocated"}
                    </span>

                    <span
                      className={`font-semibold ${
                        remaining === 0
                          ? "text-emerald-600"
                          : "text-orange-600"
                      }`}
                    >
                      ৳
                      {Math.abs(
                        remaining,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 border-t bg-muted/20 p-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isValid || isPending}
            onClick={submit}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Creating..."
              : "Create Payment Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
