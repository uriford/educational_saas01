"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { updateOrganizationAction } from "../actions/update-organization.action";
import {
  removeOrganizationLogoAction,
  updateOrganizationLogoAction,
} from "../actions/update-organization-logo.action";
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
  const [logo, setLogo] = useState(initialData.logo);
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setLogoUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result =
        await updateOrganizationLogoAction(formData);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setLogo(result.logo ?? null);
      setMessage(result.message);
      router.refresh();
    } catch {
      setMessage(
        "Something went wrong while uploading the organization logo.",
      );
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleRemoveLogo() {
    setLogoUploading(true);
    setMessage("");

    try {
      const result =
        await removeOrganizationLogoAction();

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setLogo(null);
      setMessage(result.message);
      router.refresh();
    } catch {
      setMessage(
        "Something went wrong while removing the organization logo.",
      );
    } finally {
      setLogoUploading(false);
    }
  }

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
          <div className="rounded-2xl border bg-gradient-to-br from-muted/30 via-background to-muted/10 p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-transparent shadow-sm">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={`${form.name} logo`}
                      width={112}
                      height={112}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="size-10 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Organization Logo
                  </h3>

                  <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                    Upload your organization&apos;s official logo. It will appear
                    across the platform and on public-facing organization
                    pages.
                  </p>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    JPG, PNG, or WebP · Maximum 5 MB
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 ${
                    logoUploading
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                >
                  <Upload className="size-4" />

                  {logoUploading
                    ? "Uploading..."
                    : logo
                      ? "Replace Logo"
                      : "Upload Logo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={handleLogoChange}
                  />
                </label>

                {logo && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={logoUploading}
                    onClick={handleRemoveLogo}
                    className="gap-2"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

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