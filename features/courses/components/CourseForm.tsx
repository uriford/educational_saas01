"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";

import {
  courseSchema,
  type CourseFormInput,
  type CourseFormValues,
} from "../schemas/course.schema";

import { createCourseAction } from "../actions/create-course.action";
import { updateCourseAction } from "../actions/update-course.action";

type Props = {
  mode: "create" | "edit";
  courseId?: string;
  defaultValues?: Partial<CourseFormValues>;
};

export default function CourseForm({ mode, courseId, defaultValues }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormInput, undefined, CourseFormValues>({
    resolver: zodResolver(courseSchema),

    defaultValues: {
      code: "",
      name: "",
      description: "",
      duration: undefined,
      fee: undefined,
      capacity: undefined,
      status: "INACTIVE",
      startDate: "",
      endDate: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: CourseFormValues) {
    try {
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

      toast.error("Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Course Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Course Code</Label>

          <Input id="code" placeholder="IELTS-01" {...register("code")} />

          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>

        {/* Course Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Course Name</Label>

          <Input
            id="name"
            placeholder="IELTS Preparation"
            {...register("name")}
          />

          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>

          <Input
            id="description"
            placeholder="Course description"
            {...register("description")}
          />

          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (Days)</Label>

          <Input
            id="duration"
            type="number"
            placeholder="90"
            {...register("duration", {
              valueAsNumber: true,
            })}
          />

          {errors.duration && (
            <p className="text-sm text-destructive">
              {errors.duration.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>

          <Input id="startDate" type="date" {...register("startDate")} />

          {errors.startDate && (
            <p className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>

          <Input id="endDate" type="date" {...register("endDate")} />

          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>

        {/* Fee */}
        <div className="space-y-2">
          <Label htmlFor="fee">Course Fee</Label>

          <Input
            id="fee"
            type="number"
            placeholder="15000"
            {...register("fee", {
              valueAsNumber: true,
            })}
          />

          {errors.fee && (
            <p className="text-sm text-destructive">{errors.fee.message}</p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity">Student Capacity</Label>

          <Input
            id="capacity"
            type="number"
            placeholder="30"
            {...register("capacity", {
              valueAsNumber: true,
            })}
          />

          {errors.capacity && (
            <p className="text-sm text-destructive">
              {errors.capacity.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>

          <select
            id="status"
            {...register("status")}
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="INACTIVE">Inactive</option>

            <option value="ACTIVE">Active</option>

            <option value="ARCHIVED">Archived</option>
          </select>

          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText={
          mode === "create" ? "Creating Course..." : "Updating Course..."
        }
      >
        {mode === "create" ? "Create Course" : "Update Course"}
      </LoadingButton>
    </form>
  );
}
