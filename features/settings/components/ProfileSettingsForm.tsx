"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction } from "../actions/update-profile.action";
import {
  removeProfileAvatarAction,
  updateProfileAvatarAction,
} from "../actions/update-profile-avatar.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import type { ProfileSettingsFormValues } from "../types";

type Props = {
  initialData: ProfileSettingsFormValues;
};

export default function ProfileSettingsForm({
  initialData,
}: Props) {
  const router = useRouter();
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [form, setForm] =
    useState(initialData);

  const [avatar, setAvatar] =
    useState<string | null>(
      initialData.avatar ?? null,
    );

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData =
      new FormData();

    formData.append("file", file);

    setUploading(true);

    try {
      const result =
        await updateProfileAvatarAction(
          formData,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if ("avatar" in result) {
        setAvatar(result.avatar ?? null);

        setForm((previous) => ({
          ...previous,
          avatar: result.avatar ?? null,
        }));
      }

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Something went wrong while uploading the photo.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveAvatar() {
    setUploading(true);

    try {
      const result =
        await removeProfileAvatarAction();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setAvatar(null);

      setForm((previous) => ({
        ...previous,
        avatar: null,
      }));

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Something went wrong while removing the photo.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);

    const result =
      await updateProfileAction({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });

    setSaving(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  const initials =
    `${form.firstName?.charAt(0) ?? ""}${form.lastName?.charAt(0) ?? ""}`
      .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>

        <CardDescription>
          Update the personal information associated with your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-8 rounded-2xl border bg-muted/20 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/10">
                {avatar ? (
                  <AvatarImage
                    src={avatar}
                    alt={`${form.firstName} ${form.lastName}`}
                    className="object-cover"
                  />
                ) : null}

                <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                  {initials || (
                    <UserRound className="size-10" />
                  )}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="absolute bottom-0 right-0 flex size-10 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold">
                Profile Photo
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload a clear JPG, PNG, or WebP image.
                Maximum size 5 MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                >
                  <Camera className="mr-2 size-4" />
                  {uploading
                    ? "Uploading..."
                    : "Change Photo"}
                </Button>

                {avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Remove
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>

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
                    firstName:
                      event.target.value,
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
                    lastName:
                      event.target.value,
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
                    phone:
                      event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
