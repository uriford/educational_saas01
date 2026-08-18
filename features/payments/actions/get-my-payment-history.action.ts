"use server";

import { requireStudent } from "@/features/auth/authorization";
import { db } from "@/lib/db";

export async function getMyPaymentHistoryAction() {
  const session = await requireStudent();

  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  return db.paymentTransaction.findMany({
    where: {
      installment: {
        paymentPlan: {
          organizationId: session.user.organizationId,
          branchId: session.user.branchId,
          enrollment: {
            studentId: student.id,
          },
        },
      },
    },
    select: {
      id: true,
      amount: true,
      paymentDate: true,
      method: true,
      reference: true,
      notes: true,
      installment: {
        select: {
          installmentNumber: true,
          amount: true,
          paidAmount: true,
          dueDate: true,
          status: true,
          paymentPlan: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              enrollment: {
                select: {
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
}
