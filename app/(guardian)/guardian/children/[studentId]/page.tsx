import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";

type Props = {
  params: Promise<{
    studentId: string;
  }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatValue(value: string | null | undefined) {
  return value?.trim() || "-";
}

export default async function GuardianChildProfilePage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const { studentId } = await params;

  const student = await GuardianService.getChild(
    session.user.id,
    session.user.organizationId,
    studentId,
  );

  if (!student) {
    notFound();
  }

  const fullName =
    `${student.firstName} ${student.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Guardian Portal / My Children
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {fullName}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Student ID: {student.studentId}
            </p>
          </div>

          <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {student.status}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Admission Date
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(student.admissionDate)}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Date of Birth
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(student.dateOfBirth)}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Gender
          </p>

          <p className="mt-2 font-semibold">
            {formatValue(student.gender)}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Enrollment Status
          </p>

          <p className="mt-2 font-semibold">
            {student.status}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Basic information associated with this student.
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              First Name
            </p>
            <p className="mt-1 font-medium">
              {student.firstName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last Name
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.lastName)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.email)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.phone)}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">
              Address
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.address)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Guardian Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Guardian information recorded for this student.
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Guardian Name
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.guardianName)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Guardian Phone
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.guardianPhone)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Guardian Email
            </p>
            <p className="mt-1 font-medium">
              {formatValue(student.guardianEmail)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={`/guardian/results?studentId=${student.id}`}
          className="rounded-xl border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          View Results
        </a>

        <a
          href={`/guardian/attendance?studentId=${student.id}`}
          className="rounded-xl border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          View Attendance
        </a>

        <a
          href={`/guardian/payments?studentId=${student.id}`}
          className="rounded-xl border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          View Payments
        </a>

        <a
          href={`/guardian/progress?studentId=${student.id}`}
          className="rounded-xl border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          View Progress
        </a>
      </section>
    </div>
  );
}
