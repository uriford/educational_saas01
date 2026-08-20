"use server";

import { requireAdmin, requireBranchAccess } from "@/features/auth/authorization";
import { db } from "@/lib/db";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";
import {
  createPaymentPlanSchema,
  type CreatePaymentPlanInput,
} from "../schemas/payment.schema";

export async function createPaymentPlanAction(
  input: CreatePaymentPlanInput,
) {
  const session = await requireAdmin();

  const data = createPaymentPlanSchema.parse(input);

  const enrollment = await db.courseEnrollment.findUnique({
    where: {
      id: data.enrollmentId,
    },
    include: {
      student: true,
      course: true,
      paymentPlan: true,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  if (enrollment.paymentPlan) {
    throw new Error(
      "A payment plan already exists for this enrollment",
    );
  }

  if (data.installments.length === 0) {
    throw new Error(
      "At least one installment is required",
    );
  }

  const installmentTotal = data.installments.reduce(
    (sum, installment) => sum + installment.amount,
    0,
  );

  if (
    Math.abs(
      installmentTotal - data.totalAmount,
    ) > 0.01
  ) {
    throw new Error(
      "Installment total must exactly match the payment plan total",
    );
  }

  const organizationId =
    enrollment.student.organizationId;

  const branchId =
    enrollment.student.branchId;

  if (branchId) {
    await requireBranchAccess(
      organizationId,
      branchId,
    );
  } else {
    await requireAdmin();
  }

  const plan = await db.$transaction(async (tx) => {
    const plan = await tx.paymentPlan.create({
      data: {
        organizationId,
        branchId,
        enrollmentId: enrollment.id,
        totalAmount: data.totalAmount,
        installments: {
          create: data.installments.map(
            (installment, index) => ({
              installmentNumber: index + 1,
              amount: installment.amount,
              dueDate: installment.dueDate,
              notes: installment.notes,
            }),
          ),
        },
      },
      include: {
        installments: {
          orderBy: {
            installmentNumber: "asc",
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        branchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "PaymentPlan",
        entityId: plan.id,
        description:
          `Payment plan created for student ${enrollment.student.studentId} ` +
          `for course ${enrollment.course.name}. ` +
          `Total amount: ${data.totalAmount.toFixed(2)}.`,
      },
    });

    return plan;
  });

  await NotificationAutomationService.notifyStudent({
    studentId: enrollment.student.id,
    organizationId,
    type: "INFO",
    title: "Payment plan created",
    message:
      `A payment plan of ৳${data.totalAmount.toLocaleString("en-BD")} ` +
      `has been created for ${enrollment.course.name}.`,
    href: `/student/payments`,
    dedupeKey: `student-payment-plan-created:${plan.id}`,
  });

  return plan;
}
