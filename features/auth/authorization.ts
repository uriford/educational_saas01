import { auth } from "@/auth";
import { ROLES } from "./roles";

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
