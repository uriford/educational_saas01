"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";

import {
  announcementSchema,
  type AnnouncementFormInput,
  type AnnouncementFormValues,
} from "../schemas/announcement.schema";

import { createAnnouncementAction } from "../actions/create-announcement.action";
import { updateAnnouncementAction } from "../actions/update-announcement.action";

type Props = {
  mode: "create" | "edit";
  announcementId?: string;
  defaultValues?: Partial<AnnouncementFormInput>;
};

export default function AnnouncementForm({
  mode,
  announcementId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<
    AnnouncementFormInput,
    undefined,
    AnnouncementFormValues
  >({
    resolver: zodResolver(announcementSchema),

    defaultValues: {
      title: "",
      content: "",
      status: "DRAFT",
      publishAt: undefined,
      expiresAt: undefined,
      ...defaultValues,
    },
  });

  const status = watch("status");

  async function onSubmit(data: AnnouncementFormValues) {
    try {
      const result =
        mode === "create"
          ? await createAnnouncementAction(data)
          : await updateAnnouncementAction(
              announcementId!,
              data,
            );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/announcements");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Announcement Title
        </Label>

        <Input
          id="title"
          placeholder="Important notice for students"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          Announcement Content
        </Label>

        <textarea
          id="content"
          placeholder="Write your announcement here..."
          {...register("content")}
          className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />

        {errors.content && (
          <p className="text-sm text-destructive">
            {errors.content.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status
        </Label>

        <select
          id="status"
          {...register("status")}
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {errors.status && (
          <p className="text-sm text-destructive">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Publish Date */}
      <div className="space-y-2">
        <Label htmlFor="publishAt">
          Publish Date & Time
        </Label>

        <Input
          id="publishAt"
          type="datetime-local"
          {...register("publishAt")}
        />

        <p className="text-xs text-muted-foreground">
          When the announcement should become visible.
        </p>

        {errors.publishAt && (
          <p className="text-sm text-destructive">
            {errors.publishAt.message}
          </p>
        )}
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="expiresAt">
          Expiry Date & Time
        </Label>

        <Input
          id="expiresAt"
          type="datetime-local"
          {...register("expiresAt")}
        />

        <p className="text-xs text-muted-foreground">
          Optional. The announcement will no longer be active
          after this time.
        </p>

        {errors.expiresAt && (
          <p className="text-sm text-destructive">
            {errors.expiresAt.message}
          </p>
        )}
      </div>

      {/* Scheduling hint */}
      {status === "SCHEDULED" && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium">
            Scheduled announcement
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            This announcement will be published automatically
            when its publish date arrives.
          </p>
        </div>
      )}

      {/* Submit */}
      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText={
          mode === "create"
            ? "Creating Announcement..."
            : "Updating Announcement..."
        }
      >
        {mode === "create"
          ? "Create Announcement"
          : "Update Announcement"}
      </LoadingButton>
    </form>
  );
}