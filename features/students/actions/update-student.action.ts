"use server";

import { auth } from "@/auth";

import type { StudentFormValues } from "../schemas/student.schema";
import { StudentService } from "../services/student.service";

export async function updateStudentAction(
  id: string,
  data: StudentFormValues
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Organization or Branch not found.",
    };
  }

  return StudentService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    {
      ...data,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    }
  );
}