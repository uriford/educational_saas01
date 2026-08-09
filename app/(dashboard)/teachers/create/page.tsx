import { requireAdmin } from "@/features/auth/authorization";

import TeacherForm from "@/features/teachers/components/TeacherForm";

export default async function CreateTeacherPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Create Teacher
        </h1>

        <p className="text-muted-foreground">
          Add a new teacher to your organization.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <TeacherForm mode="create" />
      </div>
    </div>
  );
}