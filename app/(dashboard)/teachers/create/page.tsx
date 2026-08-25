import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { requireAdmin } from "@/features/auth/authorization";
import TeacherForm from "@/features/teachers/components/TeacherForm";

export default async function CreateTeacherPage() {
  await requireAdmin();

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

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Create teacher
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              Add a new teacher to your organization and provide
              their personal and employment information.
            </p>
          </div>
        </div>
      </div>

      <TeacherForm mode="create" />
    </div>
  );
}
