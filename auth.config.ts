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
  console.log("🔥 AUTHORIZE START");
  console.log("credentials:", credentials);

  if (!credentials?.email || !credentials?.password) {
    console.log("❌ Missing credentials");
    return null;
  }

  try {
    const response = await AuthService.login({
      email: credentials.email as string,
      password: credentials.password as string,
    });

    console.log("🔥 AUTH SERVICE RESPONSE:", response);

    if (!response.success) {
      console.log("❌ AUTH SERVICE FAILED");
      return null;
    }

    console.log("✅ USER FOUND:", response.user.email);

    return {
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
      organizationId: response.user.organizationId,
      branchId: response.user.branchId,
      name: `${response.user.firstName} ${response.user.lastName ?? ""}`,
    };

  } catch (error) {
    console.error("🔥 AUTHORIZE CRASH:", error);
    return null;
  }
}
    }),
  ],

  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
