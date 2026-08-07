"use server";

import { auth } from "@/auth";
import { StudentService } from "../services/student.service";

export async function getStudentAction(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return StudentService.getById(
    id,
    session.user.organizationId,
    session.user.branchId
  );
}