import StudentForm from "@/features/students/components/StudentForm";

export default function CreateStudentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Add Student
      </h1>

      <StudentForm mode="create" />
    </div>
  );
}