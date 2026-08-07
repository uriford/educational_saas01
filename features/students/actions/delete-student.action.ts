"use server";

import { auth } from "@/auth";
import { StudentService } from "../services/student.service";

export async function deleteStudentAction(id: string) {
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

  return StudentService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId
  );
}