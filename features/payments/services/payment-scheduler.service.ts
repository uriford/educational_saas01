import { db } from "@/lib/db";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export class PaymentSchedulerService {
  static async syncPaymentStatuses() {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);

    let dueCount = 0;
    let overdueCount = 0;
    let reminderCount = 0;

    /*
     * UPCOMING / PARTIALLY_PAID installments:
     *
     * Due today -> DUE
     * Past due -> OVERDUE
     *
     * PAID installments are never touched.
     */
    const installments = await db.paymentInstallment.findMany({
      where: {
        status: {
          in: ["UPCOMING", "DUE", "OVERDUE", "PARTIALLY_PAID"],
        },
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

    for (const installment of installments) {
      const paid = Number(installment.paidAmount);
      const amount = Number(installment.amount);

      if (paid >= amount - 0.01) {
        if (installment.status !== "PAID") {
          await db.paymentInstallment.update({
            where: { id: installment.id },
            data: {
              status: "PAID",
              paidAt: installment.paidAt ?? now,
            },
          });
        }

        continue;
      }

      const dueDate = new Date(installment.dueDate);

      if (dueDate < today) {
        if (installment.status !== "OVERDUE") {
          await db.paymentInstallment.update({
            where: { id: installment.id },
            data: {
              status: "OVERDUE",
            },
          });

          overdueCount++;
        }

        await NotificationAutomationService.notifyStudent({
          studentId: installment.paymentPlan.enrollment.student.id,
          organizationId: installment.paymentPlan.organizationId,
          type: "ERROR",
          title: "Payment overdue",
          message:
            `Your installment ${installment.installmentNumber} ` +
            `of ৳${amount.toLocaleString("en-BD")} for ` +
            `${installment.paymentPlan.enrollment.course.name} ` +
            `is overdue.`,
          href: "/student/payments",
          dedupeKey:
            `payment-overdue:${installment.id}:${dueDate.toISOString().slice(0, 10)}`,
        });

        continue;
      }

      if (dueDate >= today && dueDate < tomorrow) {
        if (installment.status !== "DUE") {
          await db.paymentInstallment.update({
            where: { id: installment.id },
            data: {
              status: "DUE",
            },
          });

          dueCount++;
        }

        await NotificationAutomationService.notifyStudent({
          studentId: installment.paymentPlan.enrollment.student.id,
          organizationId: installment.paymentPlan.organizationId,
          type: "WARNING",
          title: "Payment due today",
          message:
            `Your installment ${installment.installmentNumber} ` +
            `of ৳${Math.max(amount - paid, 0).toLocaleString("en-BD")} ` +
            `for ${installment.paymentPlan.enrollment.course.name} ` +
            `is due today.`,
          href: "/student/payments",
          dedupeKey:
            `payment-due-today:${installment.id}:${today.toISOString().slice(0, 10)}`,
        });

        continue;
      }

      /*
       * Three-day reminder.
       * The reminder is sent when the due date falls exactly
       * three calendar days from today.
       */
      const reminderDate = addDays(today, 3);

      if (
        dueDate >= reminderDate &&
        dueDate < addDays(reminderDate, 1)
      ) {
        await NotificationAutomationService.notifyStudent({
          studentId: installment.paymentPlan.enrollment.student.id,
          organizationId: installment.paymentPlan.organizationId,
          type: "INFO",
          title: "Payment reminder",
          message:
            `Your installment ${installment.installmentNumber} ` +
            `of ৳${Math.max(amount - paid, 0).toLocaleString("en-BD")} ` +
            `for ${installment.paymentPlan.enrollment.course.name} ` +
            `is due in 3 days.`,
          href: "/student/payments",
          dedupeKey:
            `payment-reminder-3d:${installment.id}:${dueDate.toISOString().slice(0, 10)}`,
        });

        reminderCount++;
      }
    }

    return {
      processed: installments.length,
      dueCount,
      overdueCount,
      reminderCount,
      checkedAt: now.toISOString(),
    };
  }
}
