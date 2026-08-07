"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";

import {
  studentSchema,
  type StudentFormValues,
} from "../schemas/student.schema";

import { createStudentAction } from "../actions/create-student.action";
import { updateStudentAction } from "../actions/update-student.action";

type Props = {
  mode: "create" | "edit";
  studentId?: string;
  defaultValues?: Partial<StudentFormValues>;
};

export default function StudentForm({ mode, studentId, defaultValues }: Props) {
  const router = useRouter();

const {
  register,
  handleSubmit,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: StudentFormValues) {
    try {
      const result =
        mode === "create"
          ? await createStudentAction(data)
          : await updateStudentAction(studentId!, data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/students");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  }

  return (
    <form
  onSubmit={handleSubmit(onSubmit, (errors) => {
    console.log("❌ Validation Errors");
    console.log(errors);
  })}
  className="space-y-6"
>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {/* First Name */}
    <div className="space-y-2">
      <Label htmlFor="firstName">First Name</Label>

      <Input
        id="firstName"
        placeholder="John"
        {...register("firstName")}
      />

      {errors.firstName && (
        <p className="text-sm text-destructive">
          {errors.firstName.message}
        </p>
      )}
    </div>

    {/* Last Name */}
    <div className="space-y-2">
      <Label htmlFor="lastName">Last Name</Label>

      <Input
        id="lastName"
        placeholder="Doe"
        {...register("lastName")}
      />

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
        <p className="text-sm text-destructive">
          {errors.email.message}
        </p>
      )}
    </div>

    {/* Phone */}
    <div className="space-y-2">
      <Label htmlFor="phone">Phone</Label>

      <Input
        id="phone"
        placeholder="017XXXXXXXX"
        {...register("phone")}
      />

      {errors.phone && (
        <p className="text-sm text-destructive">
          {errors.phone.message}
        </p>
      )}
    </div>
  </div>

  {/* Guardian Name */}
  <div className="space-y-2">
    <Label htmlFor="guardianName">Guardian Name</Label>

    <Input
      id="guardianName"
      placeholder="Guardian Name"
      {...register("guardianName")}
    />

    {errors.guardianName && (
      <p className="text-sm text-destructive">
        {errors.guardianName.message}
      </p>
    )}
  </div>

  {/* Guardian Phone */}
  <div className="space-y-2">
    <Label htmlFor="guardianPhone">Guardian Phone</Label>

    <Input
      id="guardianPhone"
      placeholder="017XXXXXXXX"
      {...register("guardianPhone")}
    />

    {errors.guardianPhone && (
      <p className="text-sm text-destructive">
        {errors.guardianPhone.message}
      </p>
    )}
  </div>

  <LoadingButton
    type="submit"
    className="w-full"
    loading={isSubmitting}
    loadingText={
      mode === "create"
        ? "Creating Student..."
        : "Updating Student..."
    }
  >
    {mode === "create"
      ? "Create Student"
      : "Update Student"}
  </LoadingButton>
</form>
  );
}
