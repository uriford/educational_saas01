import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { BranchService } from "@/features/branches/services/branch.service";
import { GuardianService } from "@/features/guardians/services/guardian.service";
import GuardianManagement from "@/features/guardians/components/GuardianManagement";

export default async function GuardiansPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (
    session.user.role !== "ORGANIZATION_ADMIN" &&
    session.user.role !== "BRANCH_ADMIN"
  ) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/dashboard");
  }

  const organizationId =
    session.user.organizationId;

  const guardiansPromise =
    GuardianService.getAll(
      organizationId,
      session.user.branchId ?? null,
      session.user.role,
    );

  const studentsPromise =
    GuardianService.getManagementStudents(
      organizationId,
      session.user.branchId ?? null,
      session.user.role,
    );

  const branchesPromise =
    session.user.role === "ORGANIZATION_ADMIN"
      ? BranchService.getAllBranches(
          organizationId,
        )
      : Promise.resolve([]);

  const [guardians, students, branches] =
    await Promise.all([
      guardiansPromise,
      studentsPromise,
      branchesPromise,
    ]);

  return (
    <GuardianManagement
      initialGuardians={guardians}
      initialBranches={branches}
      initialStudents={students}
      actorRole={session.user.role}
      actorBranchId={
        session.user.branchId ?? null
      }
    />
  );
}
