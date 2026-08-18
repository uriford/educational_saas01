"use server";

import {
  requireAdmin,
  requireBranchAccess,
} from "@/features/auth/authorization";
import { db } from "@/lib/db";

export async function getStudentPaymentsAction(
  studentId: string,
) {
  await requireAdmin();

  const student =
    await db.student.findUnique({
      where: {
        id: studentId,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
      },
    });

  if (!student) {
    throw new Error(
      "Student not found",
    );
  }

  if (!student.branchId) {
    throw new Error(
      "This student is not assigned to a branch.",
    );
  }

  await requireBranchAccess(
    student.organizationId,
    student.branchId,
  );

  return db.paymentPlan.findMany({
    where: {
      organizationId:
        student.organizationId,
      branchId: student.branchId,
      enrollment: {
        studentId:
          student.id,
      },
    },
    include: {
      enrollment: {
        include: {
          course: true,
        },
      },
      installments: {
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
