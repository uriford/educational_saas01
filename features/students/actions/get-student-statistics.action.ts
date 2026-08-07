"use server";

import { auth } from "@/auth";
import { StudentService } from "../services/student.service";

export async function getStudentStatisticsAction() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return StudentService.getStatistics(
    session.user.organizationId,
    session.user.branchId
  );
}