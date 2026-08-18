"use client";

import { useState } from "react";

import {
  Building2,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  UserX,
  Users,
} from "lucide-react";

import {
  createAccountAction,
  deleteAccountAction,
  resetAccountPasswordAction,
  updateAccountAction,
  updateAccountStatusAction,
} from "../actions/account.actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type Account = {
  id: string;
  code: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  avatar: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type Branch = {
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

interface Props {
  initialAccounts: Account[];
  initialBranches: Branch[];
  actorRole: string;
  actorUserId: string;
  actorBranchId: string | null;
}

function getName(account: Account) {
  return [account.firstName, account.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(account: Account) {
  return `${account.firstName?.[0] ?? ""}${
    account.lastName?.[0] ?? ""
  }`.toUpperCase();
}

function roleLabel(role: string) {
  switch (role) {
    case "ORGANIZATION_ADMIN":
      return "Organization Admin";
    case "BRANCH_ADMIN":
      return "Branch Admin";
    default:
      return role;
  }
}

function formatDate(date: Date | null) {
  if (!date) return "Never";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountManagement({
  initialAccounts,
  initialBranches,
  actorRole,
  actorUserId,
  actorBranchId,
}: Props) {
  const [accounts, setAccounts] =
    useState<Account[]>(initialAccounts);

  const [branches] =
    useState<Branch[]>(initialBranches);

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null);

  const [menuId, setMenuId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [busyId, setBusyId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [role, setRole] =
    useState<"ORGANIZATION_ADMIN" | "BRANCH_ADMIN">(
      "BRANCH_ADMIN",
    );

  const [branchId, setBranchId] =
    useState(actorBranchId ?? "");

  const availableBranches =
    actorRole === "BRANCH_ADMIN"
      ? branches.filter(
          (branch) => branch.id === actorBranchId,
        )
      : branches;

  const filteredAccounts = accounts.filter(
    (account) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return [
        account.firstName,
        account.lastName,
        account.email,
        account.code,
        account.role,
        account.branch?.name,
        account.branch?.code,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        );
    },
  );

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("BRANCH_ADMIN");
    setBranchId(
      actorRole === "BRANCH_ADMIN"
        ? actorBranchId ?? ""
        : "",
    );
  }

  function openCreate() {
    resetForm();
    setEditingAccount(null);
    setShowCreate(true);
    setMessage(null);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setShowCreate(false);

    setFirstName(account.firstName);
    setLastName(account.lastName ?? "");
    setEmail(account.email);
    setPhone(account.phone ?? "");

    setRole(
      account.role === "ORGANIZATION_ADMIN"
        ? "ORGANIZATION_ADMIN"
        : "BRANCH_ADMIN",
    );

    setBranchId(account.branchId ?? "");

    setMessage(null);
  }

  function closeForm() {
    setShowCreate(false);
    setEditingAccount(null);
    resetForm();
  }

  async function handleCreate() {
    if (!firstName.trim() || !email.trim()) {
      setMessage({
        type: "error",
        text: "First name and email are required.",
      });
      return;
    }

    if (!branchId.trim()) {
      setMessage({
        type: "error",
        text: "A branch is required.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result =
        await createAccountAction({
          firstName,
          lastName,
          email,
          phone,
          role,
          branchId,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Account created successfully. Temporary password: ${result.temporaryPassword}`,
      });

      setAccounts((current) => [
        ...current,
        result.account as Account,
      ]);

      setShowCreate(false);
      resetForm();
    } catch {
      setMessage({
        type: "error",
        text: "Unable to create account.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingAccount) return;

    setLoading(true);
    setMessage(null);

    try {
      const result =
        await updateAccountAction({
          userId: editingAccount.id,
          firstName,
          lastName,
          phone,
          role,
          branchId,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setAccounts((current) =>
        current.map((account) =>
          account.id === editingAccount.id
            ? {
                ...account,
                firstName,
                lastName: lastName || null,
                phone: phone || null,
                role,
                branchId,
              }
            : account,
        ),
      );

      setMessage({
        type: "success",
        text: "Account updated successfully.",
      });

      closeForm();
    } catch {
      setMessage({
        type: "error",
        text: "Unable to update account.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(
    account: Account,
  ) {
    const nextStatus =
      account.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    setBusyId(account.id);
    setMenuId(null);
    setMessage(null);

    try {
      const result =
        await updateAccountStatusAction({
          userId: account.id,
          status: nextStatus,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      setMessage({
        type: "success",
        text: result.message,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to update account status.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetPassword(
    account: Account,
  ) {
    if (
      !window.confirm(
        `Reset the password for ${getName(account)}?`,
      )
    ) {
      return;
    }

    setBusyId(account.id);
    setMenuId(null);
    setMessage(null);

    try {
      const result =
        await resetAccountPasswordAction({
          userId: account.id,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Password reset successfully. Temporary password: ${result.temporaryPassword}`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to reset password.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(
    account: Account,
  ) {
    if (
      !window.confirm(
        `Delete ${getName(account)}? This will deactivate the account.`,
      )
    ) {
      return;
    }

    setBusyId(account.id);
    setMenuId(null);
    setMessage(null);

    try {
      const result =
        await deleteAccountAction({
          userId: account.id,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setAccounts((current) =>
        current.filter(
          (item) => item.id !== account.id,
        ),
      );

      setMessage({
        type: "success",
        text: result.message,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to delete account.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Accounts
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage administrative accounts and
            branch access.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {(showCreate || editingAccount) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                {editingAccount ? (
                  <Pencil className="h-5 w-5 text-primary" />
                ) : (
                  <UserCog className="h-5 w-5 text-primary" />
                )}
              </div>

              <div>
                <h2 className="font-semibold">
                  {editingAccount
                    ? "Edit Account"
                    : "Create Account"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {editingAccount
                    ? "Update account information and access."
                    : "Create an administrative account for your organization."}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-first-name">
                  First name
                </Label>

                <Input
                  id="account-first-name"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-last-name">
                  Last name
                </Label>

                <Input
                  id="account-last-name"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-email">
                  Email
                </Label>

                <Input
                  id="account-email"
                  type="email"
                  value={email}
                  disabled={Boolean(editingAccount)}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-phone">
                  Phone
                </Label>

                <Input
                  id="account-phone"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-role">
                  Role
                </Label>

                <select
                  id="account-role"
                  value={role}
                  disabled={
                    actorRole === "BRANCH_ADMIN"
                  }
                  onChange={(event) => {
                    const nextRole =
                      event.target.value as
                        | "ORGANIZATION_ADMIN"
                        | "BRANCH_ADMIN";

                    setRole(nextRole);

                    if (
                      nextRole ===
                      "ORGANIZATION_ADMIN"
                    ) {
                      const headquarters =
                        branches.find(
                          (branch) =>
                            branch.isHeadquarters &&
                            branch.status === "ACTIVE",
                        );

                      setBranchId(
                        headquarters?.id ?? "",
                      );
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {actorRole ===
                    "ORGANIZATION_ADMIN" && (
                    <option value="ORGANIZATION_ADMIN">
                      Organization Admin
                    </option>
                  )}

                  <option value="BRANCH_ADMIN">
                    Branch Admin
                  </option>
                </select>

                {actorRole === "ORGANIZATION_ADMIN" && (
                  <p className="text-xs text-muted-foreground">
                    Organization Admin accounts must belong to the headquarters branch.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-branch">
                  Branch
                </Label>

                <select
                  id="account-branch"
                  value={branchId}
                  disabled={
                    actorRole === "BRANCH_ADMIN"
                  }
                  onChange={(event) =>
                    setBranchId(event.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select branch
                  </option>

                  {(role ===
                  "ORGANIZATION_ADMIN"
                    ? availableBranches.filter(
                        (branch) =>
                          branch.isHeadquarters &&
                          branch.status === "ACTIVE",
                      )
                    : availableBranches
                  ).map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name} ({branch.code})
                      {branch.isHeadquarters
                        ? " — Headquarters"
                        : ""}
                    </option>
                  ))}
                </select>

                {actorRole === "BRANCH_ADMIN" && (
                  <p className="text-xs text-muted-foreground">
                    Branch administrators can only manage accounts in their own branch.
                  </p>
                )}
              </div>
            </div>

            {!editingAccount && (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="flex gap-3">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      A secure temporary password will
                      be generated automatically after
                      the account is created.
                    </p>

                    {role ===
                      "ORGANIZATION_ADMIN" && (
                      <p className="text-muted-foreground">
                        Organization Admin accounts are
                        restricted to the headquarters
                        branch.
                      </p>
                    )}

                    {actorRole ===
                      "BRANCH_ADMIN" && (
                      <p className="text-muted-foreground">
                        As a Branch Admin, you can only
                        create and manage Branch Admin
                        accounts in your own branch.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeForm}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                onClick={
                  editingAccount
                    ? handleUpdate
                    : handleCreate
                }
                disabled={
                  loading ||
                  !firstName.trim() ||
                  !email.trim() ||
                  !branchId.trim()
                }
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {editingAccount
                  ? "Save Changes"
                  : "Create Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">
                Administrative Accounts
              </h2>

              <p className="text-sm text-muted-foreground">
                {filteredAccounts.length} account
                {filteredAccounts.length === 1
                  ? ""
                  : "s"} found.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search accounts..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-medium">
                {search
                  ? "No accounts found"
                  : "No administrative accounts"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create an account to begin managing administrative access."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAccounts.map(
                (account) => (
                  <div
                    key={account.id}
                    className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage
                          src={
                            account.avatar ??
                            undefined
                          }
                        />

                        <AvatarFallback>
                          {getInitials(account)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">
                            {getName(account)}
                          </p>

                          {account.status ===
                          "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <UserX className="h-3 w-3" />
                              Suspended
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {account.email}
                          </span>

                          <span>
                            {account.code}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {roleLabel(
                              account.role,
                            )}
                          </span>

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {account.branch?.name ??
                              "No branch"}
                          </span>

                          <span>•</span>

                          <span>
                            Last login:{" "}
                            {formatDate(
                              account.lastLoginAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {account.id !== actorUserId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEdit(account)
                          }
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}

                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            busyId === account.id ||
                            account.id === actorUserId
                          }
                          onClick={() =>
                            setMenuId(
                              menuId ===
                                account.id
                                ? null
                                : account.id,
                            )
                          }
                        >
                          {busyId ===
                          account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              More
                              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                            </>
                          )}
                        </Button>

                        {menuId ===
                          account.id && (
                          <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border bg-popover p-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatus(
                                  account,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              {account.status ===
                              "ACTIVE" ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}

                              {account.status ===
                              "ACTIVE"
                                ? "Suspend"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleResetPassword(
                                  account,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              <KeyRound className="h-4 w-4" />
                              Reset Password
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  account,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Account
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="hidden text-xs text-muted-foreground xl:inline">
                        {account.emailVerified
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
