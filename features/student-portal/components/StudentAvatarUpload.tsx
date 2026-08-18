"use client";
import Image from "next/image";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  removeOwnStudentAvatarAction,
  updateOwnStudentAvatarAction,
} from "@/features/students/actions/update-own-student-avatar.action";

type Props = {
  firstName: string;
  fullName: string;
  avatar: string | null;
};

export default function StudentAvatarUpload({
  firstName,
  fullName,
  avatar,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [isPending, startTransition] = useTransition();

  function openFilePicker() {
    if (!isPending) {
      inputRef.current?.click();
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result =
        await updateOwnStudentAvatarAction(formData);

      if (result.success === true && "avatar" in result) {
        setCurrentAvatar(result.avatar ?? null);
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  function handleRemove() {
    if (!currentAvatar || isPending) return;

    startTransition(async () => {
      const result =
        await removeOwnStudentAvatarAction();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCurrentAvatar(null);
      toast.success(result.message);
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
      <div className="relative">
        {currentAvatar ? (
          <Image
            src={currentAvatar}
            alt={fullName}
            width={96}
            height={96}
            className="size-24 rounded-2xl border-4 border-card object-cover shadow-md"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-3xl font-bold text-primary shadow-md">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isPending}
          className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Change profile photo"
          title="Change profile photo"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isPending}
        />
      </div>

      <div className="pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {isPending ? "Uploading..." : "Change photo"}
          </button>

          {currentAvatar && !isPending && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          JPG, PNG or WebP · Maximum 5MB
        </p>
      </div>
    </div>
  );
}
