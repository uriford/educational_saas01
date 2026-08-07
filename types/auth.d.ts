import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      organizationId: string;
      branchId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    organizationId: string;
    branchId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    organizationId: string;
    branchId: string;
  }
}