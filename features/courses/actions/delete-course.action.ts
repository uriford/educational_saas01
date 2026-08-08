"use server";

import { auth } from "@/auth";
import { CourseService } from "../services/course.service";


export async function deleteCourseAction(
  id: string,
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

  return CourseService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId,
  );
}