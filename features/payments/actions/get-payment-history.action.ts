"use server";

import {
  requireAdmin,
} from "@/features/auth/authorization";
import { db } from "@/lib/db";

export async function getPaymentHistoryAction() {
  const session = await requireAdmin();

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      organizationId: true,
      branchId: true,
      role: true,
    },
  });

  if (!user?.organizationId) {
    throw new Error("Organization context not found");
  }

  const where = {
    installment: {
      paymentPlan: {
        organizationId: user.organizationId,
        ...(user.role === "BRANCH_ADMIN" && user.branchId
          ? { branchId: user.branchId }
          : {}),
      },
    },
  };

  const transactions = await db.paymentTransaction.findMany({
    where,
    include: {
      installment: {
        include: {
          paymentPlan: {
            include: {
              installments: {
                select: {
                  id: true,
                  amount: true,
                  paidAmount: true,
                  dueDate: true,
                  status: true,
                },
              },
              enrollment: {
                include: {
                  student: {
                    select: {
                      id: true,
                      studentId: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                      avatar: true,
                    },
                  },
                  course: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        paymentDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return transactions;
}
