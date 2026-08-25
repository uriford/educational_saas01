"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Megaphone,
  Send,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

const statusOptions = [
  {
    value: "DRAFT" as const,
    label: "Draft",
    description: "Save without making it visible.",
    icon: FileText,
  },
  {
    value: "SCHEDULED" as const,
    label: "Scheduled",
    description: "Publish automatically at the selected time.",
    icon: Clock3,
  },
  {
    value: "PUBLISHED" as const,
    label: "Published",
    description: "Make the announcement visible now.",
    icon: Send,
  },
  {
    value: "ARCHIVED" as const,
    label: "Archived",
    description: "Keep the announcement inactive.",
    icon: Archive,
  },
];

export default function AnnouncementForm({
  mode,
  announcementId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
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

  const status = useWatch({
    control,
    name: "status",
  });

  const content = useWatch({
    control,
    name: "content",
  });

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

  const actionLabel =
    status === "PUBLISHED"
      ? mode === "create"
        ? "Publish announcement"
        : "Update & publish"
      : status === "SCHEDULED"
        ? mode === "create"
          ? "Schedule announcement"
          : "Update schedule"
        : status === "ARCHIVED"
          ? mode === "create"
            ? "Save as archived"
            : "Update announcement"
          : mode === "create"
            ? "Save draft"
            : "Save changes";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-6xl"
    >
      {/* Mobile / desktop back navigation */}
      <div className="mb-5 sm:mb-6">
        <Link
          href="/announcements"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to announcements
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-12">
            <Megaphone className="size-5 sm:size-5.5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              {mode === "create"
                ? "Create announcement"
                : "Edit announcement"}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {mode === "create"
                ? "Share an important update with your organization."
                : "Review and update this announcement before publishing."}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <span
            className={`size-2 rounded-full ${
              status === "PUBLISHED"
                ? "bg-emerald-500"
                : status === "SCHEDULED"
                  ? "bg-amber-500"
                  : status === "ARCHIVED"
                    ? "bg-slate-400"
                    : "bg-primary"
            }`}
          />
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] lg:items-start lg:gap-6">
        {/* Main content */}
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/20 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                <FileText className="size-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold sm:text-base">
                  Announcement content
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Write the message your audience will receive.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6 lg:p-7">
            {/* Title */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="title"
                  className="text-sm font-medium"
                >
                  Title
                </label>

                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Required
                </span>
              </div>

              <Input
                id="title"
                placeholder="e.g. Important update for students"
                aria-invalid={!!errors.title}
                className="h-12 rounded-xl px-3.5 text-base shadow-none sm:h-13 sm:px-4 sm:text-[15px]"
                {...register("title")}
              />

              {errors.title && (
                <p className="text-xs font-medium text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="content"
                  className="text-sm font-medium"
                >
                  Message
                </label>

                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Required
                </span>
              </div>

              <div
                className={`overflow-hidden rounded-xl border bg-background transition-all ${
                  errors.content
                    ? "border-destructive ring-3 ring-destructive/10"
                    : "border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
                }`}
              >
                <Textarea
                  id="content"
                  placeholder="Write your announcement here..."
                  aria-invalid={!!errors.content}
                  className="min-h-60 resize-y rounded-none border-0 bg-transparent px-4 py-4 text-sm leading-7 shadow-none focus-visible:ring-0 sm:min-h-72 sm:text-[15px]"
                  {...register("content")}
                />

                <div className="flex items-center justify-between border-t bg-muted/20 px-3.5 py-2.5 sm:px-4">
                  <span className="text-xs text-muted-foreground">
                    Keep your message clear and easy to understand.
                  </span>

                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {(content ?? "").length} characters
                  </span>
                </div>
              </div>

              {errors.content && (
                <p className="text-xs font-medium text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Publishing controls */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b bg-muted/20 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                  <CheckCircle2 className="size-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold sm:text-base">
                    Publishing
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    Choose how this announcement behaves.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const selected = status === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue("status", option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all sm:p-4 ${
                      selected
                        ? "border-primary/40 bg-primary/[0.07] shadow-sm ring-1 ring-primary/10"
                        : "border-border bg-background hover:border-primary/25 hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>

                        <span
                          className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                            selected
                              ? "border-primary bg-primary ring-2 ring-primary/15"
                              : "border-muted-foreground/30"
                          }`}
                        />
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {errors.status && (
                <p className="pt-1 text-xs font-medium text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </section>

          {/* Publication timing */}
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b bg-muted/20 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                  <CalendarClock className="size-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold sm:text-base">
                    Publication timing
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    Control when the announcement is active.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <label
                  htmlFor="publishAt"
                  className="text-sm font-medium"
                >
                  Publish date & time
                </label>

                <Input
                  id="publishAt"
                  type="datetime-local"
                  aria-invalid={!!errors.publishAt}
                  className="h-11 rounded-xl shadow-none"
                  {...register("publishAt")}
                />

                <p className="text-xs leading-5 text-muted-foreground">
                  When the announcement should become visible.
                </p>

                {errors.publishAt && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.publishAt.message}
                  </p>
                )}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <label
                  htmlFor="expiresAt"
                  className="text-sm font-medium"
                >
                  Expiry date & time
                </label>

                <Input
                  id="expiresAt"
                  type="datetime-local"
                  aria-invalid={!!errors.expiresAt}
                  className="h-11 rounded-xl shadow-none"
                  {...register("expiresAt")}
                />

                <p className="text-xs leading-5 text-muted-foreground">
                  Optional. The announcement will no longer be active
                  after this time.
                </p>

                {errors.expiresAt && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.expiresAt.message}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Scheduling information */}
      {status === "SCHEDULED" && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 sm:mt-6 sm:p-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock3 className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Scheduled publishing is enabled
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              This announcement will be published automatically when
              its selected publish date and time arrive.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 rounded-2xl border bg-card p-3 shadow-sm sm:mt-7 sm:p-4">
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/announcements"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground sm:w-auto"
          >
            Cancel
          </Link>

          <LoadingButton
            type="submit"
            size="lg"
            className="h-11 w-full rounded-xl px-5 shadow-sm sm:w-auto"
            loading={isSubmitting}
            loadingText={
              mode === "create"
                ? "Saving announcement..."
                : "Saving changes..."
            }
          >
            <Send className="size-4" />
            {actionLabel}
          </LoadingButton>
        </div>
      </div>
    </form>
  );
}
