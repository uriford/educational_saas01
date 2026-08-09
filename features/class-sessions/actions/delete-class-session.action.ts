"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { ClassSessionService } from "../services/class-session.service";

export async function deleteClassSessionAction(data: {
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
      message: "You are not allowed to delete class sessions.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
    };
  }

  if (!session.user.branchId) {
    return {
      success: false,
      message: "Branch information is missing.",
    };
  }

  if (!data.id) {
    return {
      success: false,
      message: "Class session ID is required.",
    };
  }

  return ClassSessionService.softDelete({
    id: data.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}