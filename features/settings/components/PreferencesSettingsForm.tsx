"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type Props = {
  initialData: {
    timezone: string;
    language: string;
    currency: string;
  };
};

export default function PreferencesSettingsForm({
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

    const result =
      await updatePreferencesAction(form);

    setMessage(result.message);
    setSaving(false);

    if (result.success) {
      router.refresh();
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Configure the regional settings used by your organization.
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
                Timezone
              </label>

              <Input
                value={form.timezone}
                onChange={(event) =>
                  updateField(
                    "timezone",
                    event.target.value,
                  )
                }
                placeholder="Asia/Dhaka"
              />

              <p className="text-xs text-muted-foreground">
                Example: Asia/Dhaka
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Language
              </label>

              <Input
                value={form.language}
                onChange={(event) =>
                  updateField(
                    "language",
                    event.target.value,
                  )
                }
                placeholder="en"
              />

              <p className="text-xs text-muted-foreground">
                Example: en
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Currency
              </label>

              <Input
                value={form.currency}
                onChange={(event) =>
                  updateField(
                    "currency",
                    event.target.value,
                  )
                }
                placeholder="BDT"
              />

              <p className="text-xs text-muted-foreground">
                Example: BDT
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`text-sm ${
                message.includes("successfully")
                  ? "text-green-600"
                  : "text-destructive"
              }`}
            >
              {message}
            </p>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Preferences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
