"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { db } from "@/lib/db";

export async function getPaymentPlansAction() {
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

  return db.paymentPlan.findMany({
    where: {
      organizationId: user.organizationId,
      ...(user.role === "BRANCH_ADMIN" && user.branchId
        ? { branchId: user.branchId }
        : {}),
    },
    include: {
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
    orderBy: {
      createdAt: "desc",
    },
  });
}
