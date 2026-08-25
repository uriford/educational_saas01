"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";

import {
  teacherSchema,
  type TeacherFormValues,
} from "../schemas/teacher.schema";

import { createTeacherAction } from "../actions/create-teacher.action";
import { updateTeacherAction } from "../actions/update-teacher.action";

type Props = {
  mode: "create" | "edit";
  teacherId?: string;
  defaultValues?: Partial<TeacherFormValues>;
};

function FieldError({
  message,
}: {
  message?: string;
}) {
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
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function TeacherForm({
  mode,
  teacherId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      qualification: "",
      designation: "",
      salary: defaultValues?.salary,
      address: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: TeacherFormValues) {
    try {
      const result =
        mode === "create"
          ? await createTeacherAction(data)
          : await updateTeacherAction(teacherId!, data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/teachers");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  }

  const inputClassName =
    "h-11 rounded-lg bg-background shadow-none transition-shadow focus-visible:ring-2";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Personal Information */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b bg-muted/20 px-5 py-5 sm:px-6">
          <SectionHeader
            icon={UserRound}
            title="Personal information"
            description="Basic contact and personal details of the teacher."
          />
        </div>

        <div className="grid gap-x-6 gap-y-5 p-5 sm:p-6 md:grid-cols-2">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First name
              <span className="ml-1 text-destructive">*</span>
            </Label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="firstName"
                placeholder="John"
                className={`${inputClassName} pl-9`}
                {...register("firstName")}
              />
            </div>

            <FieldError message={errors.firstName?.message} />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>

            <Input
              id="lastName"
              placeholder="Doe"
              className={inputClassName}
              {...register("lastName")}
            />

            <FieldError message={errors.lastName?.message} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className={`${inputClassName} pl-9`}
                {...register("email")}
              />
            </div>

            <FieldError message={errors.email?.message} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="phone"
                placeholder="017XXXXXXXX"
                className={`${inputClassName} pl-9`}
                {...register("phone")}
              />
            </div>

            <FieldError message={errors.phone?.message} />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>

            <select
              id="gender"
              {...register("gender")}
              className={`${inputClassName} w-full border px-3 text-sm outline-none focus:ring-2 focus:ring-ring`}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <FieldError message={errors.gender?.message} />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of birth
            </Label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="dateOfBirth"
                type="date"
                className={`${inputClassName} pl-9`}
                {...register("dateOfBirth")}
              />
            </div>

            <FieldError message={errors.dateOfBirth?.message} />
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />

              <Input
                id="address"
                placeholder="Teacher's full address"
                className={`${inputClassName} pl-9`}
                {...register("address")}
              />
            </div>

            <FieldError message={errors.address?.message} />
          </div>
        </div>
      </section>

      {/* Employment Information */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b bg-muted/20 px-5 py-5 sm:px-6">
          <SectionHeader
            icon={BriefcaseBusiness}
            title="Employment information"
            description="Professional role, qualification, and compensation details."
          />
        </div>

        <div className="grid gap-x-6 gap-y-5 p-5 sm:p-6 md:grid-cols-2">
          {/* Qualification */}
          <div className="space-y-2">
            <Label htmlFor="qualification">
              Qualification
            </Label>

            <div className="relative">
              <GraduationCap className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="qualification"
                placeholder="Masters in English"
                className={`${inputClassName} pl-9`}
                {...register("qualification")}
              />
            </div>

            <FieldError
              message={errors.qualification?.message}
            />
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <Label htmlFor="designation">
              Designation
            </Label>

            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="designation"
                placeholder="Senior Instructor"
                className={`${inputClassName} pl-9`}
                {...register("designation")}
              />
            </div>

            <FieldError
              message={errors.designation?.message}
            />
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>

            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="salary"
                type="number"
                placeholder="35000"
                className={`${inputClassName} pl-9`}
                {...register("salary", {
                  valueAsNumber: true,
                })}
              />
            </div>

            <FieldError message={errors.salary?.message} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/teachers")}
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>

        <LoadingButton
          type="submit"
          className="h-11 rounded-lg px-6 sm:min-w-[170px]"
          loading={isSubmitting}
          loadingText={
            mode === "create"
              ? "Creating Teacher..."
              : "Updating Teacher..."
          }
        >
          {mode === "create"
            ? "Create Teacher"
            : "Save Changes"}
        </LoadingButton>
      </div>
    </form>
  );
}
