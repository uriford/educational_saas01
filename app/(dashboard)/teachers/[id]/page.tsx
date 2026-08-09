import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { TeacherService } from "@/features/teachers/services/teacher.service";

import TeacherHeader from "@/features/teachers/components/TeacherHeader";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TeacherDetailsPage({
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

  return (
    <div className="space-y-6">
      <TeacherHeader teacher={teacher} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Email
              </p>
              <p className="font-medium">
                {teacher.email ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Phone
              </p>
              <p className="font-medium">
                {teacher.phone ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Address
              </p>
              <p className="font-medium">
                {teacher.address ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Professional Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Designation
              </p>
              <p className="font-medium">
                {teacher.designation ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Qualification
              </p>
              <p className="font-medium">
                {teacher.qualification ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Salary
              </p>
              <p className="font-medium">
                {teacher.salary != null
                  ? `৳${teacher.salary.toLocaleString()}`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Gender
              </p>
              <p className="font-medium">
                {teacher.gender ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Date of Birth
              </p>
              <p className="font-medium">
                {teacher.dateOfBirth
                  ? teacher.dateOfBirth.toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Joining Date
              </p>
              <p className="font-medium">
                {teacher.joiningDate
                  ? teacher.joiningDate.toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Organization
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Organization
              </p>
              <p className="font-medium">
                {teacher.organization.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Branch
              </p>
              <p className="font-medium">
                {teacher.branch.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}