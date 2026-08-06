import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  organizationId: string | null;
  branchId: string | null;

  firstName: string;
  lastName: string | null;

  email: string;

  role: Role;

  isBranchManager: boolean;
}