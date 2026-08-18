import "next-auth";
import "next-auth/jwt";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
      branchId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    organizationId: string | null;
    branchId: string | null;
    rememberMe: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    organizationId?: string | null;
    branchId?: string | null;
    rememberMe?: boolean;
  }
}
