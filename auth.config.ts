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
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await AuthService.login({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (!response.success) {
          return null;
        }

        return {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.firstName} ${response.user.lastName ?? ""}`,
          role: response.user.role,
          organizationId: response.user.organizationId!,
          branchId: response.user.branchId!,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.branchId = user.branchId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.branchId = token.branchId;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
