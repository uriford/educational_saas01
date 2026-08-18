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
    language: "en" | "bn";
    currency: string;
    attendanceEnabled: boolean;
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
        <CardTitle>Preferences</CardTitle>

        <CardDescription>
          Configure the regional settings and features used by your organization.
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

              <div className="flex w-full max-w-md rounded-xl border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() =>
                    updateField("language", "en")
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    form.language === "en"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateField("language", "bn")
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    form.language === "bn"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🇧🇩</span>
                  <span>বাংলা</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Select the default language for your organization.
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

            <div className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Attendance
                  </label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enable attendance tracking for students and class sessions.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.attendanceEnabled}
                  onClick={() =>
                    updateField(
                      "attendanceEnabled",
                      !form.attendanceEnabled,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    form.attendanceEnabled
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                      form.attendanceEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                {form.attendanceEnabled
                  ? "Attendance tracking is enabled."
                  : "Attendance tracking is disabled."}
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
