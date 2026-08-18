"use server";

import { auth } from "@/auth";
import { OrganizationService } from "../services/organization.service";
import {
  createOrganizationSchema,
} from "../schemas/organization.schema";

export async function createOrganizationAction(
  data: unknown,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    return {
      success: false,
      message: "Forbidden.",
    };
  }

  const parsed =
    createOrganizationSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid organization data.",
    };
  }

  try {
    const result =
      await OrganizationService.create(
        session.user.id,
        session.user.role,
        parsed.data,
      );

    return {
      success: true,
      message:
        "Organization created successfully.",
      organization: result.organization,
      branch: result.branch,
      admin: result.admin,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create organization.",
    };
  }
}


export async function suspendOrganizationAction(
  organizationId: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    return {
      success: false,
      message: "Forbidden.",
    };
  }

  try {
    const result =
      await OrganizationService.suspend(
        session.user.id,
        session.user.role,
        organizationId,
      );

    return {
      success: true,
      message: "Organization suspended successfully.",
      organization: result.organization,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to suspend organization.",
    };
  }
}

export async function activateOrganizationAction(
  organizationId: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    return {
      success: false,
      message: "Forbidden.",
    };
  }

  try {
    const result =
      await OrganizationService.activate(
        session.user.id,
        session.user.role,
        organizationId,
      );

    return {
      success: true,
      message: "Organization activated successfully.",
      organization: result.organization,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to activate organization.",
    };
  }
}

export async function deleteOrganizationAction(
  organizationId: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    return {
      success: false,
      message: "Forbidden.",
    };
  }

  try {
    const result =
      await OrganizationService.remove(
        session.user.id,
        session.user.role,
        organizationId,
      );

    return {
      success: true,
      message: "Organization deleted successfully.",
      organization: result.organization,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete organization.",
    };
  }
}
