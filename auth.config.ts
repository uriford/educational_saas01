import type { NextAuthConfig } from "next-auth";
import { AUTH_CONSTANTS } from "@/features/auth/constants/auth.constants";

const authConfig = {
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.branchId = user.branchId;
        token.rememberMe = user.rememberMe;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role!;
        session.user.organizationId =
          token.organizationId ?? null;
        session.user.branchId =
          token.branchId ?? null;
        session.user.rememberMe =
          token.rememberMe ?? false;
      }

      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers">;

export default authConfig;
