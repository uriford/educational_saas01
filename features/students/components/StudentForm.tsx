"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  User,
  MapPin,
  Users,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function StudentForm({
  mode,
  studentId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const {
    register,
    setValue,
    handleSubmit,
    control,
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
      gender: undefined,
      dateOfBirth: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
      guardianEmail: "",
      ...defaultValues,
    },
  });

  const gender = useWatch({
    control,
    name: "gender",
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
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.error("Student validation errors:", formErrors);
      })}
      className="mx-auto w-full max-w-4xl space-y-8"
    >
      {/* Form introduction */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.07] via-background to-background p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary">
            <User className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {mode === "create"
                ? "Student Registration"
                : "Student Profile"}
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {mode === "create"
                ? "Add a new student"
                : "Update student information"}
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {mode === "create"
                ? "Enter the student's personal and guardian information to create their profile."
                : "Review and update the student's personal and guardian information below."}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <section className="space-y-6">
        <SectionHeader
          icon={User}
          title="Personal Information"
          description="Basic information about the student."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="firstName"
              placeholder="John"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />

            <FieldError message={errors.firstName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>

            <Input
              id="lastName"
              placeholder="Doe"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />

            <FieldHint>Optional.</FieldHint>

            <FieldError message={errors.lastName?.message} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2"
            >
              <Mail className="size-3.5 text-muted-foreground" />
              Email
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />

            <FieldHint>Optional student email address.</FieldHint>

            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="flex items-center gap-2"
            >
              <Phone className="size-3.5 text-muted-foreground" />
              Phone <span className="text-destructive">*</span>
            </Label>

            <Input
              id="phone"
              type="tel"
              placeholder="017XXXXXXXX"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />

            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender <span className="text-destructive">*</span>
            </Label>

            <Select
              value={gender}
              onValueChange={(value) =>
                setValue(
                  "gender",
                  value as StudentFormValues["gender"],
                  {
                    shouldValidate: true,
                  },
                )
              }
              aria-invalid={!!errors.gender}
            >
              <option value="">Select gender</option>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </Select>

            <FieldError message={errors.gender?.message} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dateOfBirth"
              className="flex items-center gap-2"
            >
              <CalendarDays className="size-3.5 text-muted-foreground" />
              Date of Birth
            </Label>

            <Input
              id="dateOfBirth"
              type="date"
              autoComplete="bday"
              aria-invalid={!!errors.dateOfBirth}
              {...register("dateOfBirth")}
            />

            <FieldHint>Optional.</FieldHint>

            <FieldError message={errors.dateOfBirth?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="address"
              className="flex items-center gap-2"
            >
              <MapPin className="size-3.5 text-muted-foreground" />
              Address
            </Label>

            <Textarea
              id="address"
              placeholder="Enter student's full address"
              rows={3}
              className="min-h-24 resize-y"
              aria-invalid={!!errors.address}
              {...register("address")}
            />

            <FieldHint>
              Optional. Include enough detail for administrative records.
            </FieldHint>

            <FieldError message={errors.address?.message} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      {/* Guardian Information */}
      <section className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Guardian Information"
          description="Primary contact information for the student's guardian."
        />

        <div className="rounded-xl border border-border/60 bg-muted/[0.12] p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
              <ShieldCheck className="size-4" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Primary guardian contact
              </p>

              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                This contact information can be used for important student-related communication.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardianName">
                Guardian Name{" "}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="guardianName"
                placeholder="Guardian full name"
                autoComplete="name"
                aria-invalid={!!errors.guardianName}
                {...register("guardianName")}
              />

              <FieldError message={errors.guardianName?.message} />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="guardianPhone"
                className="flex items-center gap-2"
              >
                <Phone className="size-3.5 text-muted-foreground" />
                Guardian Phone{" "}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="guardianPhone"
                type="tel"
                placeholder="017XXXXXXXX"
                autoComplete="tel"
                aria-invalid={!!errors.guardianPhone}
                {...register("guardianPhone")}
              />

              <FieldError message={errors.guardianPhone?.message} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="guardianEmail"
                className="flex items-center gap-2"
              >
                <Mail className="size-3.5 text-muted-foreground" />
                Guardian Email
              </Label>

              <Input
                id="guardianEmail"
                type="email"
                placeholder="guardian@example.com"
                autoComplete="email"
                aria-invalid={!!errors.guardianEmail}
                {...register("guardianEmail")}
              />

              <FieldHint>Optional guardian email address.</FieldHint>

              <FieldError message={errors.guardianEmail?.message} />
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-10 rounded-lg border border-input bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText={
            mode === "create"
              ? "Creating Student..."
              : "Updating Student..."
          }
          className="h-10 px-6"
        >
          {mode === "create"
            ? "Create Student"
            : "Save Changes"}
        </LoadingButton>
      </div>
    </form>
  );
}
