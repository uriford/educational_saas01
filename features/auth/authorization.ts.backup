import { auth } from "@/auth";
import { ROLES } from "./roles";

type Role = keyof typeof ROLES;

export async function requireAuth() {
  const session = await auth();

  console.log("========== REQUIRE AUTH ==========");
  console.log("USER ID:", session?.user?.id);
  console.log("USER EMAIL:", session?.user?.email);
  console.log("USER ROLE:", session?.user?.role);
  console.log("ORG ID:", session?.user?.organizationId);
  console.log("BRANCH ID:", session?.user?.branchId);
  console.log("===================================");

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireRole(
  allowedRoles: Role[],
) {
  const session = await requireAuth();

  const userRole = session.user.role;

  console.log("========== REQUIRE ROLE ==========");
  console.log("CURRENT ROLE:", userRole);
  console.log("ALLOWED ROLES:", allowedRoles);
  console.log(
    "IS ALLOWED:",
    allowedRoles.includes(userRole as Role),
  );
  console.log("===================================");

  if (
    !userRole ||
    !allowedRoles.includes(userRole as Role)
  ) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireAdmin() {
  console.log("========== REQUIRE ADMIN ==========");

  return requireRole([
    "SUPER_ADMIN",
    "ORGANIZATION_ADMIN",
    "BRANCH_ADMIN",
  ]);
}
export async function requireStudent() {
  return requireRole(["STUDENT"]);
}