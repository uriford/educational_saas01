"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,  Plus,
  ShieldCheck,
  Users,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";

import {
  createOrganizationAction,
  suspendOrganizationAction,
  activateOrganizationAction,
  deleteOrganizationAction,
} from "../actions/organization.actions";

type Organization = {
  id: string;
  code: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  hasBranches: boolean;
  createdAt: Date;
  branches: {
    id: string;
    name: string;
    code: string;
    isHeadquarters: boolean;
    status: string;
  }[];
  _count: {
    users: number;
    students: number;
    teachers: number;
  };
};

export default function OrganizationsManagement({
  initialOrganizations,
}: {
  initialOrganizations: Organization[];
}) {
  const router = useRouter();

  const [organizations, setOrganizations] =
    useState(initialOrganizations);

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] =
    useTransition();

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    adminEmail?: string;
  } | null>(null);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const data = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      adminFirstName: String(
        form.get("adminFirstName") ?? "",
      ),
      adminLastName: String(
        form.get("adminLastName") ?? "",
      ),
      adminEmail: String(
        form.get("adminEmail") ?? "",
      ),
      adminPassword: String(
        form.get("adminPassword") ?? "",
      ),
      hasBranches:
        String(form.get("hasBranches") ?? "no") === "yes",
    };

    startTransition(async () => {
      const response =
        await createOrganizationAction(data);

      if (response.success) {
        setResult({
          success: true,
          message: response.message,
          adminEmail: response.admin?.email,
        });

        if (response.organization) {
          const organization =
            response.organization;

          setOrganizations((current) => [
            {
              ...organization,
              branches: response.branch
                ? [
                    {
                      id: response.branch.id,
                      name: response.branch.name,
                      code: response.branch.code,
                      isHeadquarters:
                        response.branch.isHeadquarters,
                      status:
                        response.branch.status,
                    },
                  ]
                : [],
              hasBranches:
                response.organization.hasBranches,
              _count: {
                users: 1,
                students: 0,
                teachers: 0,
              },
            } as Organization,
            ...current,
          ]);
        }

        formElement.reset();


      } else {
        setResult({
          success: false,
          message: response.message,
        });
      }
    });
  }

  function handleOrganizationStatusAction(
    organizationId: string,
    action: "suspend" | "activate" | "delete",
  ) {
    const organization = organizations.find(
      (item) => item.id === organizationId,
    );

    if (!organization) {
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        `Delete "${organization.name}"?\n\nThis will remove the organization from the active organization list. Its data will be soft deleted and not physically removed.`,
      );

      if (!confirmed) {
        return;
      }
    }

    if (action === "suspend") {
      const confirmed = window.confirm(
        `Suspend "${organization.name}"?\n\nUsers of this organization will no longer be able to use the organization while it is suspended.`,
      );

      if (!confirmed) {
        return;
      }
    }

    startTransition(async () => {
      let response;

      if (action === "suspend") {
        response =
          await suspendOrganizationAction(
            organizationId,
          );
      } else if (action === "activate") {
        response =
          await activateOrganizationAction(
            organizationId,
          );
      } else {
        response =
          await deleteOrganizationAction(
            organizationId,
          );
      }

      if (!response.success) {
        setResult({
          success: false,
          message: response.message,
        });
        return;
      }

      if (action === "delete") {
        setOrganizations((current) =>
          current.filter(
            (item) => item.id !== organizationId,
          ),
        );
      } else {
        setOrganizations((current) =>
          current.map((item) =>
            item.id === organizationId
              ? {
                  ...item,
                  status:
                    action === "suspend"
                      ? "SUSPENDED"
                      : "ACTIVE",
                }
              : item,
          ),
        );
      }

      setResult({
        success: true,
        message: response.message,
      });

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organizations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage organizations across the SaaS platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setResult(null);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">
            No organizations yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the first organization to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organizations.map((organization) => (
            <div
              key={organization.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {organization.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {organization.code}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    organization.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-700"
                      : organization.status === "SUSPENDED"
                        ? "bg-yellow-500/10 text-yellow-700"
                        : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {organization.status}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Branches
                  </span>
                  <span className="font-medium">
                    {organization.branches.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Users
                  </span>
                  <span className="font-medium">
                    {organization._count.users}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Students
                  </span>
                  <span className="font-medium">
                    {organization._count.students}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Teachers
                  </span>
                  <span className="font-medium">
                    {organization._count.teachers}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {organization.status === "ACTIVE" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleOrganizationStatusAction(
                          organization.id,
                          "suspend",
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium text-yellow-700 hover:bg-yellow-500/10 disabled:opacity-50"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Suspend
                    </button>
                  )}

                  {organization.status === "SUSPENDED" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleOrganizationStatusAction(
                          organization.id,
                          "activate",
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium text-green-700 hover:bg-green-500/10 disabled:opacity-50"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Activate
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleOrganizationStatusAction(
                        organization.id,
                        "delete",
                      )
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  HQ:{" "}
                  {organization.branches.find(
                    (branch) =>
                      branch.isHeadquarters,
                  )?.name ?? "Not configured"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border bg-background p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Create Organization
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This creates the organization and its first
                organization administrator. A headquarters branch
                is created only when branches are enabled.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">
                    Organization Name
                  </label>
                  <input
                    name="name"
                    required
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="American Council"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Organization Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="info@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Phone
                  </label>
                  <input
                    name="phone"
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+880..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Admin First Name
                  </label>
                  <input
                    name="adminFirstName"
                    required
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Admin Last Name
                  </label>
                  <input
                    name="adminLastName"
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">
                    Admin Email
                  </label>
                  <input
                    name="adminEmail"
                    type="email"
                    required
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="adminPassword"
                    className="text-sm font-medium"
                  >
                    Organization Admin Password
                  </label>

                  <input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Create a strong password"
                  />

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Create a strong password to enter to the organization
                    later. This password will be used by the organization
                    administrator to access the organization.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Password must contain at least 8 characters, including
                    uppercase, lowercase, and a number.
                  </p>
                </div>

                <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-4">
                  <label className="text-sm font-medium">
                    Does this organization have branches?
                  </label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose Yes if the organization will operate
                    multiple locations or branches. Choose No
                    for a single-location organization.
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border bg-background p-3 hover:bg-muted">
                      <input
                        type="radio"
                        name="hasBranches"
                        value="yes"
                        required
                        className="mt-1"
                      />

                      <span>
                        <span className="block text-sm font-medium">
                          Yes, it has branches
                        </span>

                        <span className="block text-xs text-muted-foreground">
                          A headquarters branch will be created
                          and branch management will be available.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-md border bg-background p-3 hover:bg-muted">
                      <input
                        type="radio"
                        name="hasBranches"
                        value="no"
                        className="mt-1"
                      />

                      <span>
                        <span className="block text-sm font-medium">
                          No, single location
                        </span>

                        <span className="block text-xs text-muted-foreground">
                          No branch will be created and the admin
                          goes directly to the organization dashboard.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {result &&
                !result.success && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {result.message}
                  </div>
                )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending
                    ? "Creating..."
                    : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
