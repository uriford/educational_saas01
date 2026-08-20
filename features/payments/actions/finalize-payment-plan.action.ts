"use server";

import {
  requireAdmin,
  requireBranchAccess,
} from "@/features/auth/authorization";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";

export async function finalizePaymentPlanAction(
  paymentPlanId: string,
) {
  const session = await requireAdmin();

  const result = await db.$transaction(
    async (tx) => {
      const plan =
        await tx.paymentPlan.findUnique({
          where: {
            id: paymentPlanId,
          },
          include: {
            installments: true,
            enrollment: {
              include: {
                student: true,
                course: true,
              },
            },
          },
        });

      if (!plan) {
        throw new Error(
          "Payment plan not found",
        );
      }

      if (plan.branchId) {
        await requireBranchAccess(
          plan.organizationId,
          plan.branchId,
        );
      } else {
        await requireAdmin();
      }

      if (plan.status === "FINALIZED") {
        throw new Error(
          "Payment plan is already finalized",
        );
      }

      const totalPaid =
        plan.installments.reduce(
          (sum, installment) =>
            sum +
            Number(
              installment.paidAmount,
            ),
          0,
        );

      const totalAmount =
        Number(plan.totalAmount);

      if (
        totalPaid <
        totalAmount - 0.01
      ) {
        throw new Error(
          "Payment plan cannot be finalized while a balance remains",
        );
      }

      const finalizedAt = new Date();

      const finalizedPlan =
        await tx.paymentPlan.update({
          where: {
            id: paymentPlanId,
          },
          data: {
            status: "FINALIZED",
            finalizedAt,
            finalizedById:
              session.user.id,
          },
        });

      await tx.auditLog.create({
        data: {
          organizationId:
            plan.organizationId,
          branchId: plan.branchId,
          userId: session.user.id,
          action: "UPDATE",
          entityType: "PaymentPlan",
          entityId: plan.id,
          description:
            `Payment plan finalized for student ` +
            `${plan.enrollment.student.studentId} ` +
            `for course ${plan.enrollment.course.name}. ` +
            `Total amount: ${totalAmount.toFixed(2)}.`,
        },
      });

      return {
        plan: finalizedPlan,
        organizationId: plan.organizationId,
        studentId: plan.enrollment.student.id,
        courseName: plan.enrollment.course.name,
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
    title: "Payment record finalized",
    message:
      `Your payment record for ${result.courseName} ` +
      `has been fully paid and finalized.`,
    href: `/student/payments`,
    dedupeKey:
      `student-payment-plan-finalized:${result.plan.id}`,
  });

  return result.plan;
}
