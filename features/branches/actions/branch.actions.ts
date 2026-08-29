"use server";

import { auth } from "@/auth";
import { BranchService } from "../services/branch.service";
import type { SetBranchCreationPasswordInput } from "../types";
import { resetBranchCreationPasswordSchema } from "../schemas/reset-branch-creation-password.schema";

export async function createBranchAction(data: {
  name: string;
  email: string;
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

export async function updateBranchEmailAction(
  data: {
    email: string;
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
    return await BranchService.updateBranchEmail(
      session.user.organizationId,
      session.user.id,
      data.email,
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update branch email.",
    };
  }
}

export async function setBranchCreationPasswordAction(
  data: SetBranchCreationPasswordInput,
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


export async function getOrganizationUsersAction() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
      users: [],
    };
  }

  try {
    const users =
      await BranchService.getOrganizationUsers(
        session.user.organizationId,
        session.user.id,
      );

    return {
      success: true,
      message: "Users loaded successfully.",
      users,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load organization users.",
      users: [],
    };
  }
}

export async function assignBranchAdminAction(data: {
  userId: string;
  branchId: string;
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
        "Only organization admins can assign branch administrators.",
    };
  }

  try {
    return await BranchService.assignBranchAdmin(
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
          : "Unable to assign branch administrator.",
    };
  }
}

export async function requestBranchCreationPasswordResetAction() {
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

  if (
    session.user.role !== "ORGANIZATION_ADMIN"
  ) {
    return {
      success: false,
      message:
        "Only organization admins can reset the branch creation password.",
    };
  }

  try {
    return await BranchService.requestCreationPasswordReset(
      session.user.organizationId,
      session.user.id,
    );
  } catch (error) {
    console.error(
      "BRANCH CREATION PASSWORD RESET REQUEST ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to process the password reset request.",
    };
  }
}

export async function resetBranchCreationPasswordAction(
  data: unknown,
) {
  const parsed =
    resetBranchCreationPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid password reset data.",
    };
  }

  try {
    return await BranchService.resetCreationPassword(
      parsed.data,
    );
  } catch (error) {
    console.error(
      "BRANCH CREATION PASSWORD RESET ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reset branch creation password.",
    };
  }
}
