import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { TeacherService } from "@/features/teachers/services/teacher.service";

import TeacherForm from "@/features/teachers/components/TeacherForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTeacherPage({
  params,
}: Props) {
  const session = await requireAdmin();

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    notFound();
  }

  const { id } = await params;

  const teacher = await TeacherService.getById(
    id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!teacher) {
    notFound();
  }

  const teacherName =
    `${teacher.firstName} ${teacher.lastName ?? ""}`.trim();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-4">
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to teachers
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Pencil className="size-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Edit teacher
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Update {teacherName}&apos;s personal and
                employment information.
              </p>
            </div>
          </div>

          <div className="w-fit rounded-xl border bg-muted/30 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Teacher ID
            </p>

            <p className="mt-0.5 font-mono text-sm font-semibold">
              {teacher.teacherId}
            </p>
          </div>
        </div>
      </div>

      <TeacherForm
        mode="edit"
        teacherId={teacher.id}
        defaultValues={{
          firstName: teacher.firstName,
          lastName: teacher.lastName ?? "",
          email: teacher.email ?? "",
          phone: teacher.phone ?? "",
          gender: teacher.gender ?? "MALE",
          dateOfBirth: teacher.dateOfBirth
            ? teacher.dateOfBirth.toISOString().split("T")[0]
            : "",
          qualification: teacher.qualification ?? "",
          designation: teacher.designation ?? "",
          salary:
            teacher.salary != null
              ? Number(teacher.salary)
              : undefined,
          address: teacher.address ?? "",
        }}
      />
    </div>
  );
}
