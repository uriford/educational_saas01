import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import GuardianSidebar from "@/features/guardian-portal/components/GuardianSidebar";

export default async function GuardianLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const guardian = await GuardianService.getProfileByUserId(
    session.user.id,
    session.user.organizationId,
  );

  if (!guardian) {
    redirect("/login");
  }

  const firstName =
    guardian.user.firstName ||
    session.user.name?.split(" ")[0] ||
    "Guardian";

  const fullName =
    `${guardian.user.firstName ?? ""} ${guardian.user.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <GuardianSidebar
          firstName={firstName}
          fullName={fullName}
        />

        <div className="min-w-0 flex-1">
          <header className="border-b bg-background px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Welcome, {firstName}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Guardian Portal
                </p>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
