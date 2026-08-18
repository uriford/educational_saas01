import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BranchRepository } from "@/features/branches/repository/branch.repository";

type Props = {
  params: Promise<{
    organizationId: string;
    branchId: string;
  }>;
};

export default async function OrganizationBranchSettingsPage({
  params,
}: Props) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/organizations");
  }

  const { organizationId, branchId } = await params;

  const branch =
    await BranchRepository.findBranch(
      organizationId,
      branchId,
    );

  if (!branch) {
    redirect("/organizations");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Branch Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage branch configuration for this organization.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Branch Name
            </p>
            <p className="mt-1 font-medium">
              {branch.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Branch Code
            </p>
            <p className="mt-1 font-medium">
              {branch.code}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Branch Status
            </p>
            <p className="mt-1 font-medium">
              {branch.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Headquarters
            </p>
            <p className="mt-1 font-medium">
              {branch.isHeadquarters
                ? "Yes"
                : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
