import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { OrganizationService } from "@/features/organizations/services/organization.service";
import OrganizationsManagement from "@/features/organizations/components/OrganizationsManagement";

export default async function OrganizationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const organizations =
    await OrganizationService.getAll(
      session.user.role,
    );

  return (
    <OrganizationsManagement
      initialOrganizations={organizations}
    />
  );
}
