import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { AuthService } from "@/features/auth/services/auth.service";

export default {
  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        rememberMe: {
          label: "Remember me",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await AuthService.login({
          email: String(credentials.email),
          password: String(credentials.password),
          rememberMe: String(credentials.rememberMe) === "true",
        });

        if (!response.success) {
          return null;
        }

        return {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.firstName} ${response.user.lastName ?? ""}`.trim(),
          role: response.user.role,
          organizationId: response.user.organizationId,
          branchId: response.user.branchId,
          rememberMe:
            String(credentials.rememberMe) === "true",
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.branchId = user.branchId;
        token.rememberMe = user.rememberMe;
      }

      if (token.rememberMe) {
        token.exp = Math.floor(
          Date.now() / 1000 +
            60 * 60 * 24 * 7,
        );
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role!;
        session.user.organizationId = token.organizationId ?? null;
        session.user.branchId = token.branchId ?? null;
        session.user.rememberMe = token.rememberMe ?? false;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
