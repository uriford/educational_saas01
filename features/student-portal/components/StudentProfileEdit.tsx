"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, Loader2, Save, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { updateOwnStudentProfileAction } from "@/features/students/actions/update-own-student-profile.action";
import type { UpdateOwnStudentProfileData } from "@/features/students/schemas/update-own-student-profile.schema";

type Student = {
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  address: string | null;
};

type Props = {
  student: Student;
};

export default function StudentProfileEdit({
  student,
}: Props) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [form, setForm] =
    useState<UpdateOwnStudentProfileData>({
      firstName: student.firstName,
      lastName: student.lastName ?? "",
      phone: student.phone ?? "",
      gender:
        student.gender === "MALE" ||
        student.gender === "FEMALE" ||
        student.gender === "OTHER"
          ? student.gender
          : undefined,
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",
      address: student.address ?? "",
      guardianName: student.guardianName ?? "",
      guardianPhone: student.guardianPhone ?? "",
      guardianEmail: student.guardianEmail ?? "",
    });

  function updateField(
    field: keyof UpdateOwnStudentProfileData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const result =
        await updateOwnStudentProfileAction(form);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/student/profile");
      router.refresh();
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error,
      );

      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 sm:space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="font-semibold">
            Personal Information
          </h2>

          <div className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name
                </Label>

                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    updateField(
                      "firstName",
                      e.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name
                </Label>

                <Input
                  id="lastName"
                  value={form.lastName ?? ""}
                  onChange={(e) =>
                    updateField(
                      "lastName",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                value={student.email ?? ""}
                disabled
              />

              <p className="text-xs text-muted-foreground">
                Email is managed by the organization.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone
              </Label>

              <Input
                id="phone"
                value={form.phone ?? ""}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender
              </Label>

              <select
                id="gender"
                value={form.gender ?? ""}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    gender:
                      e.target.value === ""
                        ? undefined
                        : (e.target.value as
                            | "MALE"
                            | "FEMALE"
                            | "OTHER"),
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Select gender
                </option>
                <option value="MALE">
                  Male
                </option>
                <option value="FEMALE">
                  Female
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth
              </Label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="dateOfBirth"
                  type="date"
                  value={
                    form.dateOfBirth ?? ""
                  }
                  onChange={(e) =>
                    updateField(
                      "dateOfBirth",
                      e.target.value,
                    )
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address
              </Label>

              <textarea
                id="address"
                value={form.address ?? ""}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value,
                  )
                }
                rows={4}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="font-semibold">
            Guardian Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep your guardian or emergency contact
            information up to date.
          </p>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="guardianName">
                Guardian Name
              </Label>

              <Input
                id="guardianName"
                value={
                  form.guardianName ?? ""
                }
                onChange={(e) =>
                  updateField(
                    "guardianName",
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianEmail">
                Guardian Email
              </Label>

              <Input
                id="guardianEmail"
                type="email"
                placeholder="guardian@example.com"
                value={form.guardianEmail ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    guardianEmail: e.target.value,
                  })
                }
              />

              <Label htmlFor="guardianPhone">
                Guardian Phone
              </Label>

              <Input
                id="guardianPhone"
                value={
                  form.guardianPhone ?? ""
                }
                onChange={(e) =>
                  updateField(
                    "guardianPhone",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/student/profile")}
          disabled={isSubmitting}
        >
          <X className="size-4" />
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
