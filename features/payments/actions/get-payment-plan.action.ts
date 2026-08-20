"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { requireBranchAccess } from "@/features/auth/authorization";
import { db } from "@/lib/db";

export async function getPaymentPlanAction(
  enrollmentId: string,
) {
  await requireAdmin();

  const plan = await db.paymentPlan.findUnique({
    where: {
      enrollmentId,
    },
    include: {
      enrollment: {
        include: {
          student: true,
          course: true,
        },
      },
      installments: {
        orderBy: {
          installmentNumber: "asc",
        },
        include: {
          transactions: {
            orderBy: {
              paymentDate: "desc",
            },
          },
        },
      },
    },
  });

  if (!plan) {
    return null;
  }

  if (plan.branchId) {
    await requireBranchAccess(
      plan.organizationId,
      plan.branchId,
    );
  } else {
    await requireAdmin();
  }

  return plan;
}
