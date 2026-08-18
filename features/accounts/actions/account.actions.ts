"use server";

import { auth } from "@/auth";

import {
  createAccountSchema,
  deleteAccountSchema,
  resetAccountPasswordSchema,
  updateAccountSchema,
  updateAccountStatusSchema,
} from "../schemas/account.schema";

import { AccountService } from "../services/account.service";

function unauthorized(message = "Unauthorized.") {
  return {
    success: false as const,
    message,
  };
}

async function getSessionContext() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !session.user.role
  ) {
    return null;
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId ?? null,
    role: session.user.role,
  };
}

export async function getAccountsAction(search?: string) {
  const context = await getSessionContext();

  if (!context) {
    return {
      success: false as const,
      message: "Unauthorized.",
      accounts: [],
    };
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return {
      success: false as const,
      message: "You do not have permission to manage accounts.",
      accounts: [],
    };
  }

  try {
    const accounts = await AccountService.getAll(
      context.organizationId,
      context.branchId,
      context.role,
      search,
    );

    return {
      success: true as const,
      accounts,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load accounts.",
      accounts: [],
    };
  }
}

export async function getAccountAction(userId: string) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to manage accounts.",
    );
  }

  if (!userId?.trim()) {
    return unauthorized("Account ID is required.");
  }

  try {
    const account = await AccountService.getById(
      context.organizationId,
      context.branchId,
      context.role,
      userId,
    );

    if (!account) {
      return {
        success: false as const,
        message: "Account not found.",
      };
    }

    return {
      success: true as const,
      account,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load account.",
    };
  }
}

export async function createAccountAction(
  input: unknown,
) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to create accounts.",
    );
  }

  const parsed =
    createAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ??
        "Invalid account data.",
    };
  }

  try {
    return await AccountService.create(
      context.organizationId,
      context.userId,
      context.branchId,
      context.role,
      parsed.data,
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create account.",
    };
  }
}

export async function updateAccountAction(
  input: unknown,
) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to update accounts.",
    );
  }

  const parsed =
    updateAccountSchema
      .extend({
        userId: deleteAccountSchema.shape.userId,
      })
      .safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid account data.",
    };
  }

  const { userId, ...data } = parsed.data;

  try {
    return await AccountService.update(
      context.organizationId,
      context.userId,
      context.branchId,
      context.role,
      userId,
      data,
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update account.",
    };
  }
}

export async function updateAccountStatusAction(
  input: unknown,
) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to change account status.",
    );
  }

  const parsed =
    updateAccountStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid status data.",
    };
  }

  try {
    return await AccountService.updateStatus(
      context.organizationId,
      context.userId,
      context.branchId,
      context.role,
      parsed.data.userId,
      parsed.data.status,
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update account status.",
    };
  }
}

export async function resetAccountPasswordAction(
  input: unknown,
) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to reset account passwords.",
    );
  }

  const parsed =
    resetAccountPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid account data.",
    };
  }

  try {
    return await AccountService.resetPassword(
      context.organizationId,
      context.userId,
      context.branchId,
      context.role,
      parsed.data.userId,
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reset account password.",
    };
  }
}

export async function deleteAccountAction(
  input: unknown,
) {
  const context = await getSessionContext();

  if (!context) {
    return unauthorized();
  }

  if (
    context.role !== "ORGANIZATION_ADMIN" &&
    context.role !== "BRANCH_ADMIN"
  ) {
    return unauthorized(
      "You do not have permission to delete accounts.",
    );
  }

  const parsed =
    deleteAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid account data.",
    };
  }

  try {
    return await AccountService.delete(
      context.organizationId,
      context.userId,
      context.branchId,
      context.role,
      parsed.data.userId,
    );
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete account.",
    };
  }
}
