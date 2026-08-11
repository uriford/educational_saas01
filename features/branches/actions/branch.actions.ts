"use server";

import { auth } from "@/auth";
import { BranchService } from "../services/branch.service";

export async function createBranchAction(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  creationPassword: string;
}) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "ORGANIZATION_ADMIN") {
    return {
      success: false,
      message:
        "Only organization admins can create branches.",
    };
  }

  try {
    return await BranchService.createBranch(
      session.user.organizationId,
      session.user.id,
      data,
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create branch.",
    };
  }
}

export async function setBranchCreationPasswordAction(
  data: {
    password: string;
  },
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  try {
    return await BranchService.setCreationPassword(
      session.user.organizationId,
      session.user.id,
      data,
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update branch creation password.",
    };
  }
}
