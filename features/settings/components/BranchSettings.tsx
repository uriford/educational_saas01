"use client";

import { useState, useTransition } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateBranchEmailAction } from "@/features/branches/actions/branch.actions";

type Props = {
  branch: {
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
    status: string;
  } | null;
};

export default function BranchSettings({
  branch,
}: Props) {
  const [email, setEmail] = useState(branch?.email ?? "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!branch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branch</CardTitle>
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
          Information about the branch associated with your account.
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

          <div className="md:col-span-2">
            <p className="mb-1 text-sm text-muted-foreground">
              Branch Email
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
                placeholder="branch@example.com"
                disabled={isPending}
                className="sm:max-w-md"
              />

              <Button
                type="button"
                disabled={
                  isPending ||
                  !email.trim() ||
                  email.trim() === (branch.email ?? "")
                }
                onClick={() => {
                  setMessage("");

                  startTransition(async () => {
                    const result =
                      await updateBranchEmailAction({
                        email,
                      });

                    setMessage(result.message);

                    if (result.success) {
                      setEmail(email.trim());
                    }
                  });
                }}
              >
                {isPending ? "Saving..." : "Save Email"}
              </Button>
            </div>

            {message && (
              <p className="mt-2 text-sm text-muted-foreground">
                {message}
              </p>
            )}

            <p className="mt-1 text-xs text-muted-foreground">
              You can update the email address for your assigned branch.
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