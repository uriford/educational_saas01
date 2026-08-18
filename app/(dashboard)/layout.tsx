import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { SettingsService } from "@/features/settings/services/settings.service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { db } from "@/lib/db";

async function getInitialTheme(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { themePreference: true },
  });

  return (
    user?.themePreference?.toLowerCase() as
      | "light"
      | "dark"
      | "system"
  ) ?? "system";
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ==========================================
  // ADMIN DASHBOARD — ADMIN ROLES ONLY
  // ==========================================
  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "ORGANIZATION_ADMIN" &&
    session.user.role !== "BRANCH_ADMIN"
  ) {
    if (session.user.role === "GUARDIAN") {
      redirect("/guardian");
    }

    if (session.user.role === "STUDENT") {
      redirect("/student");
    }

    redirect("/login");
  }

  // ==========================================
  // SUPER ADMIN — PLATFORM LEVEL
  // ==========================================
  if (session.user.role === "SUPER_ADMIN") {
    const initialTheme = await getInitialTheme(session.user.id);

    return (
      <ThemeProvider
        initialTheme={initialTheme}
        storageKey={`theme-${session.user.id}`}
        target="html"
      >
        <DashboardLayout
        organization={{
          name: "American Council Platform",
          logo: null,
        }}
        user={{
          firstName: session.user.name?.split(" ")[0] ?? "Super",
          lastName:
            session.user.name
              ?.split(" ")
              .slice(1)
              .join(" ") ?? "Admin",
          role: "SUPER_ADMIN",
          avatar: null,
        }}
      >
          {children}
        </DashboardLayout>
      </ThemeProvider>
    );
  }

  // ==========================================
  // ORGANIZATION / BRANCH / STUDENT USERS
  // ==========================================
  if (!session.user.organizationId) {
    redirect("/login");
  }

  const settings = await SettingsService.getSettings(
    session.user.organizationId,
    session.user.id,
    session.user.branchId ?? undefined,
  );

  if (!settings.organization || !settings.user) {
    redirect("/login");
  }

  const initialTheme = await getInitialTheme(session.user.id);

  return (
    <ThemeProvider
      initialTheme={initialTheme}
      storageKey={`theme-${session.user.id}`}
      target="html"
    >
      <DashboardLayout
      organization={{
        name: settings.organization.name,
        logo: settings.organization.logo,
      }}
      user={{
        firstName: settings.user.firstName,
        lastName: settings.user.lastName ?? "",
        role: String(settings.user.role),
        avatar: settings.user.avatar,
      }}
    >
        {children}
      </DashboardLayout>
    </ThemeProvider>
  );
}
