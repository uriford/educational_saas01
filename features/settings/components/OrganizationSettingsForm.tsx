"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateOrganizationAction } from "../actions/update-organization.action";
import { updatePreferencesAction } from "../actions/update-preferences.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { OrganizationSettingsFormValues } from "../types";

type Props = {
  initialData: OrganizationSettingsFormValues;
};

export default function OrganizationSettingsForm({
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

    const organizationResult =
      await updateOrganizationAction({
        name: form.name,
        email: form.email,
        phone: form.phone,
        domain: form.domain,
      });

    if (!organizationResult.success) {
      setMessage(organizationResult.message);
      setSaving(false);
      return;
    }

    const preferencesResult =
      await updatePreferencesAction({
        timezone: form.timezone,
        language: form.language,
        currency: form.currency,
        attendanceEnabled: form.attendanceEnabled,
      });

    setMessage(
      preferencesResult.success
        ? "Changes saved successfully."
        : preferencesResult.message,
    );

    setSaving(false);

    if (preferencesResult.success) {
      router.refresh();
    }
  }

  function updateField(
    field: keyof OrganizationSettingsFormValues,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          Manage your organization information and regional preferences.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <input
                id="attendanceEnabled"
                type="checkbox"
                checked={form.attendanceEnabled}
                onChange={(event) =>
                  updateField(
                    "attendanceEnabled",
                    event.target.checked,
                  )
                }
                className="mt-1 size-4 rounded border-input accent-primary"
              />

              <div>
                <label
                  htmlFor="attendanceEnabled"
                  className="text-sm font-medium"
                >
                  Attendance Tracking
                </label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Enable student attendance tracking for this organization.
                  When disabled, attendance will not be required.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Organization Name
              </label>

              <Input
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
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
                  updateField("phone", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Domain
              </label>

              <Input
                value={form.domain}
                onChange={(event) =>
                  updateField("domain", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Timezone
              </label>

              <Input
                value={form.timezone}
                onChange={(event) =>
                  updateField("timezone", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Language
              </label>

              <Input
                value={form.language}
                onChange={(event) =>
                  updateField("language", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Currency
              </label>

              <Input
                value={form.currency}
                onChange={(event) =>
                  updateField("currency", event.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {message}
            </p>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}