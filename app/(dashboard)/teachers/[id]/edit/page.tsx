import { notFound } from "next/navigation";

import { auth } from "@/auth";

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
  const session = await auth();

  if (
    !session?.user?.organizationId ||
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Teacher
        </h1>

        <p className="text-sm text-muted-foreground">
          Update {teacher.firstName}&apos;s information.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
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
            salary: teacher.salary ? Number(teacher.salary) : undefined,
            address: teacher.address ?? "",
          }}
        />
      </div>
    </div>
  );
}