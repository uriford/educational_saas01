"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  KeyRound,
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

type Props = {
  branch: Branch;
  isHeadquartersAdmin: boolean;
  passwordConfigured: boolean;
};

export default function BranchManagement({
  branch,
  isHeadquartersAdmin,
  passwordConfigured,
}: Props) {
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

  const [passwordMessage, setPasswordMessage] =
    useState("");

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Branch
          </CardTitle>

          <CardDescription>
            Create another branch under your organization.
            Branch creation requires the organization's
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
                    Branch Email
                  </label>

                  <Input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="branch@example.com"
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
              change the organization's special branch
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

      <BranchSettingsSummary branch={branch} />
    </div>
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
