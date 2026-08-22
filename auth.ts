import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { AuthService } from "@/features/auth/services/auth.service";
import { db } from "@/lib/db";

console.log(
  "AUTH SECRET EXISTS:",
  !!process.env.AUTH_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  secret: process.env.AUTH_SECRET,

  useSecureCookies:
    process.env.NODE_ENV === "production",

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

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
        console.log(
          "[AUTH TEST] authorize() ENTERED",
        );

        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          console.log(
            "[AUTH TEST] Missing credentials",
          );

          return null;
        }

        try {
          const response =
            await AuthService.login({
              email: String(credentials.email),
              password: String(credentials.password),
              rememberMe:
                String(credentials.rememberMe) ===
                "true",
            });

          console.log(
            "[AUTH TEST] AuthService result:",
            {
              success: response.success,
              message: response.message,
            },
          );

          if (!response.success) {
            return null;
          }

          return {
            id: response.user.id,
            email: response.user.email,
            name: `${response.user.firstName} ${
              response.user.lastName ?? ""
            }`.trim(),
            role: response.user.role,
            organizationId:
              response.user.organizationId,
            branchId:
              response.user.branchId,
            rememberMe:
              String(credentials.rememberMe) ===
              "true",
          };
        } catch (error) {
          console.error(
            "[AUTH TEST] authorize() EXCEPTION:",
            error,
          );

          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId =
          user.organizationId;
        token.branchId = user.branchId;
        token.rememberMe = user.rememberMe;
      }

      if (token.id) {
        const dbUser =
          await db.user.findUnique({
            where: {
              id: token.id as string,
            },
            select: {
              role: true,
              organizationId: true,
              branchId: true,
            },
          });

        if (dbUser) {
          token.role = dbUser.role;
          token.organizationId =
            dbUser.organizationId;
          token.branchId =
            dbUser.branchId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.id as string) ??
          token.sub ??
          "";
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
});
