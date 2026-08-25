"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/common/LoadingButton";

import {
  courseSchema,
  type CourseFormValues,
} from "../schemas/course.schema";

import { createCourseAction } from "../actions/create-course.action";
import { updateCourseAction } from "../actions/update-course.action";

type Props = {
  mode: "create" | "edit";
  courseId?: string;
  defaultValues?: Partial<CourseFormValues>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CourseForm({
  mode,
  courseId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),

    defaultValues: {
      code: "",
      name: "",
      description: "",
      duration: undefined,
      totalClasses: undefined,
      fee: undefined,
      capacity: undefined,
      status: "INACTIVE",
      startDate: "",
      endDate: "",
      ...defaultValues,
    },
  });

  const selectedStatus = useWatch({
    control,
    name: "status",
  });

  const selectedStartDate = useWatch({
    control,
    name: "startDate",
  });

  async function onSubmit(data: CourseFormValues) {
    try {
      if (
        data.startDate &&
        data.endDate &&
        data.endDate < data.startDate
      ) {
        toast.error("End date cannot be before the start date.");
        return;
      }

      const result =
        mode === "create"
          ? await createCourseAction(data)
          : await updateCourseAction(courseId!, data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/courses");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Basic Information */}
      <section className="space-y-6">
        <SectionHeader
          icon={BookOpen}
          title="Basic Information"
          description="Define the identity and purpose of this course."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Course Code
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="code"
              placeholder="IELTS-01"
              autoComplete="off"
              aria-invalid={!!errors.code}
              {...register("code")}
            />

            <p className="text-xs text-muted-foreground">
              Use a short unique identifier for this course.
            </p>

            <FieldError message={errors.code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Course Name
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="name"
              placeholder="IELTS Preparation"
              aria-invalid={!!errors.name}
              {...register("name")}
            />

            <p className="text-xs text-muted-foreground">
              Choose a clear name students and staff will recognize.
            </p>

            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">
              Description
            </Label>

            <Textarea
              id="description"
              placeholder="Describe what students will learn, who the course is for, and what it includes..."
              className="min-h-28 resize-y"
              aria-invalid={!!errors.description}
              {...register("description")}
            />

            <p className="text-xs text-muted-foreground">
              Give students and staff useful context about the course.
            </p>

            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      {/* Schedule */}
      <section className="space-y-6">
        <SectionHeader
          icon={CalendarDays}
          title="Course Schedule"
          description="Set the expected duration and course dates."
        />

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>

            <div className="relative">
              <Input
                id="duration"
                type="number"
                min="0"
                step="1"
                placeholder="90"
                className="pr-16"
                aria-invalid={!!errors.duration}
                {...register("duration", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                days
              </span>
            </div>

            <FieldError message={errors.duration?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalClasses">
              Total Classes
            </Label>

            <div className="relative">
              <Input
                id="totalClasses"
                type="number"
                min="1"
                step="1"
                placeholder="20"
                className="pr-20"
                aria-invalid={!!errors.totalClasses}
                {...register("totalClasses", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                classes
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Optional. Leave blank to calculate progress automatically from actual class duration.
            </p>

            <FieldError message={errors.totalClasses?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>

            <Input
              id="startDate"
              type="date"
              aria-invalid={!!errors.startDate}
              {...register("startDate")}
            />

            <FieldError message={errors.startDate?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>

            <Input
              id="endDate"
              type="date"
              min={selectedStartDate || undefined}
              aria-invalid={!!errors.endDate}
              {...register("endDate")}
            />

            <FieldError message={errors.endDate?.message} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      {/* Enrollment & Pricing */}
      <section className="space-y-6">
        <SectionHeader
          icon={GraduationCap}
          title="Enrollment & Pricing"
          description="Configure capacity and the course fee."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fee">Course Fee</Label>

            <div className="relative">
              <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="15000"
                className="pl-9"
                aria-invalid={!!errors.fee}
                {...register("fee", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Leave empty if the course is free.
            </p>

            <FieldError message={errors.fee?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">
              Student Capacity
            </Label>

            <div className="relative">
              <Input
                id="capacity"
                type="number"
                min="1"
                step="1"
                placeholder="30"
                className="pr-16"
                aria-invalid={!!errors.capacity}
                {...register("capacity", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                seats
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Leave empty if enrollment is unlimited.
            </p>

            <FieldError message={errors.capacity?.message} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      {/* Status */}
      <section className="space-y-6">
        <SectionHeader
          icon={BookOpen}
          title="Course Status"
          description="Control whether this course is currently available."
        />

        <div className="max-w-md space-y-2">
          <Label htmlFor="status">Status</Label>

          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setValue(
                "status",
                value as CourseFormValues["status"],
                {
                  shouldValidate: true,
                },
              )
            }
          >
            <SelectItem value="INACTIVE">
              Inactive
            </SelectItem>

            <SelectItem value="ACTIVE">
              Active
            </SelectItem>

            <SelectItem value="ARCHIVED">
              Archived
            </SelectItem>
          </Select>

          <p className="text-xs text-muted-foreground">
            Active courses can be made available for enrollment.
            Archived courses should generally no longer be used.
          </p>

          <FieldError message={errors.status?.message} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText={
            mode === "create"
              ? "Creating Course..."
              : "Updating Course..."
          }
        >
          {mode === "create"
            ? "Create Course"
            : "Save Changes"}
        </LoadingButton>
      </div>
    </form>
  );
}
