import "server-only";

import { auth } from "@/auth";
import { ROLES } from "./roles";
import { SubscriptionService } from "@/features/subscriptions/services/subscription.service";

type Role = keyof typeof ROLES;

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireRole(
  allowedRoles: Role[],
) {
  const session = await requireAuth();

  const userRole = session.user.role as Role;

  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole([
    "SUPER_ADMIN",
    "ORGANIZATION_ADMIN",
    "BRANCH_ADMIN",
  ]);
}

export async function requireOrganizationAdmin() {
  return requireRole([
    "ORGANIZATION_ADMIN",
  ]);
}

export async function requireBranchAdmin() {
  return requireRole([
    "BRANCH_ADMIN",
  ]);
}

export async function requireStudent() {
  return requireRole([
    "STUDENT",
  ]);
}

export async function requireGuardian() {
  return requireRole([
    "GUARDIAN",
  ]);
}

export async function requireOrganizationAccess(
  organizationId: string,
) {
  const session = await requireAuth();

  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.organizationId !== organizationId
  ) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireBranchAccess(
  organizationId: string,
  branchId: string,
) {
  const session = await requireAuth();

  if (session.user.role === "SUPER_ADMIN") {
    return session;
  }

  if (session.user.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  if (
    session.user.role === "ORGANIZATION_ADMIN"
  ) {
    return session;
  }

  if (
    session.user.branchId !== branchId
  ) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireActiveSubscription() {
  const session = await requireAuth();

  // Platform-level administrators are never restricted
  // by a tenant organization's subscription.
  if (session.user.role === "SUPER_ADMIN") {
    return session;
  }

  if (!session.user.organizationId) {
    throw new Error("Organization access required");
  }

  const hasAccess =
    await SubscriptionService.hasAccess(
      session.user.organizationId,
    );

  if (!hasAccess) {
    throw new Error("Subscription inactive");
  }

  return session;
}

export async function requireActiveOrganizationAccess(
  organizationId: string,
) {
  const session =
    await requireOrganizationAccess(
      organizationId,
    );

  if (session.user.role === "SUPER_ADMIN") {
    return session;
  }

  const hasAccess =
    await SubscriptionService.hasAccess(
      organizationId,
    );

  if (!hasAccess) {
    throw new Error("Subscription inactive");
  }

  return session;
}

