"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AssessmentService } from "../services/assessment.service";

export async function deleteAssessmentAction(data: {
  id: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      success: false,
      message:
        "You are not allowed to delete assessments.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message:
        "Organization information is missing.",
    };
  }

  if (!session.user.branchId) {
    return {
      success: false,
      message:
        "Branch information is missing.",
    };
  }

  if (!data.id) {
    return {
      success: false,
      message: "Assessment ID is required.",
    };
  }

  return AssessmentService.delete(
    data.id,
    session.user.organizationId,
    session.user.branchId,
  );
}
