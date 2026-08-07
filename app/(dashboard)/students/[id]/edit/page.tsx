import { notFound } from "next/navigation";

import StudentForm from "@/features/students/components/StudentForm";

import { getStudentByIdAction } from "@/features/students/actions/get-student-by-id.action";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStudentPage({
  params,
}: Props) {
  const { id } = await params;

  const student = await getStudentByIdAction(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Edit Student
      </h1>

      <StudentForm
        mode="edit"
        studentId={student.id}
        defaultValues={{
          firstName: student.firstName,
          lastName: student.lastName ?? "",
          email: student.email ?? "",
          phone: student.phone ?? "",
          gender: student.gender ?? "MALE",
          dateOfBirth: student.dateOfBirth
            ? student.dateOfBirth.toISOString().split("T")[0]
            : "",
          address: student.address ?? "",
          guardianName: student.guardianName ?? "",
          guardianPhone: student.guardianPhone ?? "",
        }}
      />
    </div>
  );
}