"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateProfileAction } from "../actions/update-profile.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { ProfileSettingsFormValues } from "../types";

type Props = {
  initialData: ProfileSettingsFormValues;
};

export default function ProfileSettingsForm({
  initialData,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const result = await updateProfileAction(form);

    setMessage(result.message);
    setSaving(false);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Update the personal information associated with your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                First Name
              </label>

              <Input
                value={form.firstName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    firstName: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Last Name
              </label>

              <Input
                value={form.lastName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    lastName: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Phone
              </label>

              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {message}
            </p>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}