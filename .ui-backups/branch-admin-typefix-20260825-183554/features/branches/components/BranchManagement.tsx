"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  KeyRound,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  createBranchAction,
  setBranchCreationPasswordAction,
  getOrganizationUsersAction,
  assignBranchAdminAction,
} from "../actions/branch.actions";

type Branch = {
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isHeadquarters: boolean;
  status: string;
} | null;

type AllBranch = {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isHeadquarters: boolean;
  status: string;
  createdAt: Date;
};

type OrganizationUser = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  role: string;
  branchId: string | null;
  isBranchManager: boolean;
  branch: {
    id: string;
    name: string;
    code: string;
    isHeadquarters: boolean;
  } | null;
};

type Props = {
  branch: Branch;
  allBranches: AllBranch[];
  isHeadquartersAdmin: boolean;
  passwordConfigured: boolean;
};

export default function BranchManagement({
  branch,
  allBranches,
  isHeadquartersAdmin,
  passwordConfigured,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creationPassword, setCreationPassword] =
    useState("");

  const [newSecurityPassword, setNewSecurityPassword] =
    useState("");

  const [savingBranch, setSavingBranch] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [branchMessage, setBranchMessage] =
    useState("");

  const [branchCredentials, setBranchCredentials] =
    useState<{
      branchName: string;
      email: string;
      temporaryPassword: string;
    } | null>(null);

  const [organizationUsers, setOrganizationUsers] =
    useState<OrganizationUser[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [selectedBranchId, setSelectedBranchId] =
    useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [assigningAdmin, setAssigningAdmin] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  if (!isHeadquartersAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branch
            </CardTitle>

            <CardDescription>
              View information about your assigned branch.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                {branch?.name ?? "No branch assigned"}
              </p>

              {branch?.code && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {branch.code}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function loadOrganizationUsers() {
    setLoadingUsers(true);
    setAssignmentMessage("");

    const result =
      await getOrganizationUsersAction();

    if (result.success) {
      setOrganizationUsers(
        result.users as OrganizationUser[],
      );

      if (result.users.length > 0) {
        setSelectedUserId(
          result.users[0].id,
        );
      }
    } else {
      setAssignmentMessage(result.message);
    }

    setLoadingUsers(false);
  }

  async function handleAssignBranchAdmin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedUserId || !selectedBranchId) {
      setAssignmentMessage(
        "Select a user and a branch.",
      );
      return;
    }

    setAssigningAdmin(true);
    setAssignmentMessage("");

    const result =
      await assignBranchAdminAction({
        userId: selectedUserId,
        branchId: selectedBranchId,
      });

    setAssignmentMessage(result.message);

    if (result.success) {
      await loadOrganizationUsers();
      router.refresh();
    }

    setAssigningAdmin(false);
  }

  async function handleCreateBranch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSavingBranch(true);
    setBranchMessage("");

    const result = await createBranchAction({
      name,
      email,
      phone,
      address,
      creationPassword,
    });

    setBranchMessage(result.message);

    if (result.success) {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCreationPassword("");

      if (
        result.branch &&
        result.temporaryPassword
      ) {
        setBranchCredentials({
          branchName: result.branch.name,
          email:
            result.branchAdmin?.email ??
            result.branch.email ??
            "",
          temporaryPassword:
            result.temporaryPassword,
        });
      }

      router.refresh();
    }

    setSavingBranch(false);
  }

  async function handlePasswordUpdate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSavingPassword(true);
    setPasswordMessage("");

    const result =
      await setBranchCreationPasswordAction({
        password: newSecurityPassword,
      });

    setPasswordMessage(result.message);

    if (result.success) {
      setNewSecurityPassword("");
    }

    setSavingPassword(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {branchCredentials && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Branch Administrator Credentials
            </CardTitle>

            <CardDescription>
              Branch "{branchCredentials.branchName}" was
              created successfully. Give these credentials
              directly to the Branch Administrator. The
              temporary password is shown here because the
              system does not send it by email.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Login Email
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold">
                  {branchCredentials.email}
                </p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Temporary Password
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold">
                  {branchCredentials.temporaryPassword}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-medium">
                  Keep these credentials secure
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The password is stored securely as a hash.
                  This is the only time the temporary password
                  is displayed. The Branch Administrator can
                  use it immediately with this email to sign in.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Branch
          </CardTitle>

          <CardDescription>
            Create another branch under your organization.
            Branch creation requires the organization&apos;s
            special branch creation password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!passwordConfigured ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    Branch creation password is not configured.
                  </p>

                  <p className="text-sm text-muted-foreground">
                    The headquarters administrator must set
                    the special branch creation password
                    before branches can be created.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleCreateBranch}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Branch Name
                  </label>

                  <Input
                    required
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="e.g. Agrabad Branch"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Branch Admin Login Email
                  </label>

                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="branch-admin@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Branch Phone
                  </label>

                  <Input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Address
                  </label>

                  <Input
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Special Branch Creation Password
                  </label>

                  <Input
                    required
                    type="password"
                    autoComplete="off"
                    value={creationPassword}
                    onChange={(event) =>
                      setCreationPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter the organization branch password"
                  />

                  <p className="text-xs text-muted-foreground">
                    This password is verified securely on the
                    server and is never stored or returned.
                  </p>
                </div>
              </div>

              {branchMessage && (
                <p
                  className={`text-sm ${
                    branchMessage.includes("successfully")
                      ? "text-green-600"
                      : "text-destructive"
                  }`}
                >
                  {branchMessage}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={savingBranch}
                >
                  {savingBranch
                    ? "Creating Branch..."
                    : "Create Branch"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {isHeadquartersAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Branch Creation Security
            </CardTitle>

            <CardDescription>
              Only the headquarters administrator can set or
              change the organization&apos;s special branch
              creation password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlePasswordUpdate}
              className="flex flex-col gap-5"
            >
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  <p className="text-sm font-medium">
                    {passwordConfigured
                      ? "Branch creation password is configured."
                      : "Branch creation password is not configured."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {passwordConfigured
                    ? "New Branch Creation Password"
                    : "Branch Creation Password"}
                </label>

                <Input
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={16}
                  value={newSecurityPassword}
                  onChange={(event) =>
                    setNewSecurityPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Minimum 16 characters"
                />

                <p className="text-xs text-muted-foreground">
                  Use at least 16 characters with uppercase,
                  lowercase, numbers, and a special character.
                </p>
              </div>

              {passwordMessage && (
                <p
                  className={`text-sm ${
                    passwordMessage.includes("successfully")
                      ? "text-green-600"
                      : "text-destructive"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? "Saving..."
                    : passwordConfigured
                      ? "Change Branch Password"
                      : "Set Branch Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Branch Administrators
          </CardTitle>

          <CardDescription>
            Assign an existing organization user to manage a
            specific branch.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <form
            onSubmit={handleAssignBranchAdmin}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  User
                </label>

                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={selectedUserId}
                  onChange={(event) =>
                    setSelectedUserId(
                      event.target.value,
                    )
                  }
                  onFocus={() => {
                    if (
                      organizationUsers.length === 0 &&
                      !loadingUsers
                    ) {
                      loadOrganizationUsers();
                    }
                  }}
                  disabled={loadingUsers || assigningAdmin}
                >
                  <option value="">
                    {loadingUsers
                      ? "Loading users..."
                      : "Select a user"}
                  </option>

                  {organizationUsers
                    .filter(
                      (user) =>
                        user.role !==
                        "ORGANIZATION_ADMIN",
                    )
                    .map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.email}
                        {" — "}
                        {user.firstName}
                        {user.lastName
                          ? ` ${user.lastName}`
                          : ""}
                        {user.branch
                          ? ` — ${user.branch.name}`
                          : ""}
                      </option>
                    ))}
                </select>

                <p className="text-xs text-muted-foreground">
                  Organization and branch administrators are
                  protected from accidental reassignment.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Working Branch
                </label>

                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={selectedBranchId}
                  onChange={(event) =>
                    setSelectedBranchId(
                      event.target.value,
                    )
                  }
                  disabled={assigningAdmin}
                >
                  <option value="">
                    Select a branch
                  </option>

                  {allBranches
                    .filter(
                      (item) =>
                        item.status === "ACTIVE" &&
                        !item.isHeadquarters,
                    )
                    .map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name} ({item.code})
                      </option>
                    ))}
                </select>

                <p className="text-xs text-muted-foreground">
                  Branch administrators are assigned to
                  non-headquarters branches.
                </p>
              </div>
            </div>

            {assignmentMessage && (
              <p
                className={`text-sm ${
                  assignmentMessage.includes(
                    "now the branch administrator",
                  )
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {assignmentMessage}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  assigningAdmin ||
                  loadingUsers ||
                  !selectedUserId ||
                  !selectedBranchId
                }
              >
                {assigningAdmin
                  ? "Assigning..."
                  : "Assign Branch Administrator"}
              </Button>
            </div>
          </form>

          <div className="border-t pt-5">
            <h3 className="mb-3 text-sm font-semibold">
              Current Branch Administrators
            </h3>

            {organizationUsers.filter(
              (user) =>
                user.role === "BRANCH_ADMIN",
            ).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No branch administrators have been assigned
                yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {organizationUsers
                  .filter(
                    (user) =>
                      user.role ===
                      "BRANCH_ADMIN",
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {user.email}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {user.firstName}
                            {user.lastName
                              ? ` ${user.lastName}`
                              : ""}
                          </p>
                        </div>

                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Working Branch
                          </p>

                          <p className="font-medium">
                            {user.branch?.name ??
                              "No branch"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BranchSettingsSummary branch={branch} />

      <AllBranchesSummary branches={allBranches} />
    </div>
  );
}

function AllBranchesSummary({
  branches,
}: {
  branches: AllBranch[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          All Branches
        </CardTitle>

        <CardDescription>
          All active branches belonging to your organization.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {branches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="text-sm font-medium">
              No branches found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first branch to see it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {branches.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      {item.isHeadquarters && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Headquarters
                        </span>
                      )}

                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Branch Code: {item.code}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm md:min-w-[420px] md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Email
                      </p>
                      <p className="font-medium">
                        {item.email || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Phone
                      </p>
                      <p className="font-medium">
                        {item.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Address
                      </p>
                      <p className="font-medium">
                        {item.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BranchSettingsSummary({
  branch,
}: {
  branch: Branch;
}) {
  if (!branch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Branch</CardTitle>
          <CardDescription>
            Your current branch information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            No branch is assigned to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Branch</CardTitle>
        <CardDescription>
          Information about the branch associated with your
          account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Branch Name
            </p>
            <p className="font-medium">{branch.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Branch Code
            </p>
            <p className="font-medium">{branch.code}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="font-medium">
              {branch.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>
            <p className="font-medium">
              {branch.phone || "Not provided"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Address
            </p>
            <p className="font-medium">
              {branch.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>
            <p className="font-medium">{branch.status}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Headquarters
            </p>
            <p className="font-medium">
              {branch.isHeadquarters ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
