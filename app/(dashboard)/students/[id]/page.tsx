import { notFound } from "next/navigation";

import StudentHeader from "@/features/students/components/details/StudentHeader";
import StudentInfoCard from "@/features/students/components/details/StudentInfoCard";
import GuardianCard from "@/features/students/components/details/GuardianCard";
import OrganizationCard from "@/features/students/components/details/OrganizationCard";
import StudentActions from "@/features/students/components/details/StudentActions";
import { getStudentAction } from "@/features/students/actions/get-student.actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentDetailsPage({ params }: Props) {
  const { id } = await params;

  const student = await getStudentAction(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <StudentHeader student={student} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentInfoCard student={student} />

        <GuardianCard student={student} />
      </div>

      <OrganizationCard student={student} />

      <StudentActions studentId={student.id} />
    </div>
  );
}
