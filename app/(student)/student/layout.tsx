import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { db } from "@/lib/db";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import StudentSidebar from "@/features/student-portal/components/StudentSidebar";
import StudentHeader from "@/features/student-portal/components/StudentHeader";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  console.log("========== STUDENT SESSION DEBUG ==========");
  console.log(JSON.stringify(session, null, 2));

  if (!session?.user?.id) {
    console.log("NO SESSION USER ID");
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  const student = session.user.organizationId
    ? await StudentService.getByUserId(
        session.user.id,
        session.user.organizationId,
        session.user.branchId ?? undefined,
      )
    : null;

  if (!student) {
    const userSettings = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        themePreference: true,
      },
    });

    const initialTheme =
      (userSettings?.themePreference?.toLowerCase() as
        | "light"
        | "dark"
        | "system") ?? "system";

    return (
      <ThemeProvider
        initialTheme={initialTheme}
        storageKey={`theme-${session.user.id}`}
      >
        <main className="min-h-screen bg-muted/30 p-6">
          {children}
        </main>
      </ThemeProvider>
    );
  }

  const userSettings = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      themePreference: true,
    },
  });

  const initialTheme =
    (userSettings?.themePreference?.toLowerCase() as
      | "light"
      | "dark"
      | "system") ?? "system";

  const fullName =
    `${student.firstName} ${student.lastName ?? ""}`.trim();

  return (
    <ThemeProvider
      initialTheme={initialTheme}
      storageKey={`theme-${session.user.id}`}
    >
      <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <StudentSidebar
          firstName={student.firstName}
          fullName={fullName}
          avatar={student.avatar}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentHeader
            firstName={student.firstName}
            fullName={fullName}
            avatar={student.avatar}
          />

          <main className="flex-1">
            <div className="border-b bg-background px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
              <Breadcrumbs />
            </div>

            <div className="p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      </div>
    </ThemeProvider>
  );
}
