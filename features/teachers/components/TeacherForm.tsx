"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function TeacherForm({ mode, teacherId, defaultValues }: Props) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* First Name */}

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>

          <Input id="firstName" placeholder="John" {...register("firstName")} />

          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>

          <Input id="lastName" placeholder="Doe" {...register("lastName")} />

          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>

          <Input id="phone" placeholder="017XXXXXXXX" {...register("phone")} />

          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Gender */}

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>

          <select
            id="gender"
            {...register("gender")}
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="MALE">Male</option>

            <option value="FEMALE">Female</option>

            <option value="OTHER">Other</option>
          </select>

          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>

        {/* DOB */}

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>

          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </div>

        {/* Qualification */}

        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>

          <Input
            id="qualification"
            placeholder="Masters in English"
            {...register("qualification")}
          />
        </div>

        {/* Designation */}

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>

          <Input
            id="designation"
            placeholder="Senior Instructor"
            {...register("designation")}
          />
        </div>

        {/* Salary */}

        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>

          <Input
            id="salary"
            type="number"
            placeholder="35000"
            {...register("salary", {valueAsNumber: true})}
          />
        </div>

        {/* Address */}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>

          <Input
            id="address"
            placeholder="Teacher Address"
            {...register("address")}
          />
        </div>
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText={
          mode === "create" ? "Creating Teacher..." : "Updating Teacher..."
        }
      >
        {mode === "create" ? "Create Teacher" : "Update Teacher"}
      </LoadingButton>
    </form>
  );
}
