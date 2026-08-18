"use server";

import {
  requireAdmin,
  requireBranchAccess,
} from "@/features/auth/authorization";
import { db } from "@/lib/db";
import {
  recordPaymentSchema,
  type RecordPaymentInput,
} from "../schemas/payment.schema";
import { Prisma } from "@prisma/client";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";

export async function recordPaymentAction(
  input: RecordPaymentInput,
) {
  const session = await requireAdmin();

  const data =
    recordPaymentSchema.parse(input);

  const result = await db.$transaction(
    async (tx) => {
      const installment =
        await tx.paymentInstallment.findUnique({
          where: {
            id: data.installmentId,
          },
          include: {
            paymentPlan: {
              include: {
                enrollment: {
                  include: {
                    student: true,
                    course: true,
                  },
                },
              },
            },
          },
        });

      if (!installment) {
        throw new Error(
          "Installment not found",
        );
      }

      const plan =
        installment.paymentPlan;

      if (!plan.branchId) {
        throw new Error(
          "A branch is required to record a payment.",
        );
      }

      await requireBranchAccess(
        plan.organizationId,
        plan.branchId,
      );

      if (
        plan.status === "FINALIZED"
      ) {
        throw new Error(
          "This payment plan has been finalized and is read-only",
        );
      }

      const remaining =
        Number(installment.amount) -
        Number(installment.paidAmount);

      if (
        data.amount >
        remaining + 0.01
      ) {
        throw new Error(
          `Payment exceeds remaining installment balance of ${remaining.toFixed(2)}`,
        );
      }

      const transaction =
        await tx.paymentTransaction.create({
          data: {
            installmentId:
              installment.id,
            amount:
              new Prisma.Decimal(
                data.amount,
              ),
            paymentDate:
              data.paymentDate ??
              new Date(),
            method: data.method,
            reference:
              data.reference,
            notes: data.notes,
            recordedById:
              session.user.id,
          },
        });

      const newPaidAmount =
        Number(
          installment.paidAmount,
        ) + data.amount;

      const installmentAmount =
        Number(installment.amount);

      const newStatus =
        newPaidAmount >=
        installmentAmount
          ? "PAID"
          : "PARTIALLY_PAID";

      await tx.paymentInstallment.update({
        where: {
          id: installment.id,
        },
        data: {
          paidAmount:
            new Prisma.Decimal(
              newPaidAmount,
            ),
          paidAt:
            newStatus === "PAID"
              ? data.paymentDate ??
                new Date()
              : null,
          status: newStatus,
        },
      });

      const allInstallments =
        await tx.paymentInstallment.findMany({
          where: {
            paymentPlanId:
              installment.paymentPlanId,
          },
        });

      const totalPaid =
        allInstallments.reduce(
          (sum, item) =>
            sum +
            Number(
              item.paidAmount,
            ),
          0,
        );

      const totalAmount =
        Number(plan.totalAmount);

      const allPaid =
        totalPaid >=
        totalAmount - 0.01;

      if (allPaid) {
        await tx.paymentPlan.update({
          where: {
            id: installment.paymentPlanId,
          },
          data: {
            status: "PAID",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          organizationId:
            plan.organizationId,
          branchId:
            plan.branchId,
          userId:
            session.user.id,
          action: "CREATE",
          entityType:
            "PaymentTransaction",
          entityId:
            transaction.id,
          description:
            `Payment of ${data.amount.toFixed(2)} ` +
            `recorded for student ` +
            `${plan.enrollment.student.studentId} ` +
            `for course ${plan.enrollment.course.name}. ` +
            `Method: ${data.method}.`,
        },
      });

      return {
        transaction,
        organizationId: plan.organizationId,
        studentId: plan.enrollment.student.id,
        courseName: plan.enrollment.course.name,
        installmentNumber:
          installment.installmentNumber,
        installmentStatus: newStatus,
        planStatus: allPaid ? "PAID" : plan.status,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  await NotificationAutomationService.notifyStudent({
    studentId: result.studentId,
    organizationId: result.organizationId,
    type: "SUCCESS",
    title: "Payment received",
    message:
      `Your payment of ৳${data.amount.toLocaleString("en-BD")} ` +
      `for ${result.courseName} has been recorded successfully. ` +
      `Installment ${result.installmentNumber} is ` +
      `${result.installmentStatus === "PAID" ? "fully paid." : "partially paid."}`,
    href: `/student/payments`,
    dedupeKey:
      `student-payment-recorded:${result.transaction.id}`,
  });

  if (result.planStatus === "PAID") {
    await NotificationAutomationService.notifyStudent({
      studentId: result.studentId,
      organizationId: result.organizationId,
      type: "SUCCESS",
      title: "Payment plan fully paid",
      message:
        `Congratulations! Your payment plan for ${result.courseName} ` +
        `has been fully paid.`,
      href: `/student/payments`,
      dedupeKey:
        `student-payment-plan-paid:${result.transaction.id}`,
    });
  }

  return result.transaction;
}
