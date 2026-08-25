import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import GuardianPortalShell from "@/features/guardian-portal/components/GuardianPortalShell";

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
    `${guardian.user.firstName ?? ""} ${
      guardian.user.lastName ?? ""
    }`.trim();

  return (
    <GuardianPortalShell
      firstName={firstName}
      fullName={fullName}
    >
      {children}
    </GuardianPortalShell>
  );
}
