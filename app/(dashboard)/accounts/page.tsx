import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { AccountService } from "@/features/accounts/services/account.service";
import { BranchService } from "@/features/branches/services/branch.service";
import ChatAccountsManagement from "@/features/accounts/components/AccountManagement";

export default async function AccountsPage() {
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

  const accountsPromise = AccountService.getAll(
    session.user.organizationId,
    session.user.branchId ?? null,
    session.user.role,
  );

  const branchesPromise =
    session.user.role === "ORGANIZATION_ADMIN"
      ? BranchService.getAllBranches(
          session.user.organizationId,
        )
      : Promise.resolve(
          session.user.branchId
            ? []
            : [],
        );

  const [accounts, branches] = await Promise.all([
    accountsPromise,
    branchesPromise,
  ]);

  return (
    <ChatAccountsManagement
      initialAccounts={accounts}
      initialBranches={branches}
      actorRole={session.user.role}
      actorUserId={session.user.id}
      actorBranchId={session.user.branchId ?? null}
    />
  );
}
