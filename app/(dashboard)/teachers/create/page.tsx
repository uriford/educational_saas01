import TeacherForm from "@/features/teachers/components/TeacherForm";


export default function CreateTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Teacher</h1>

        <p className="text-muted-foreground">
          Add a new teacher to your organization.
        </p>
      </div>

      <TeacherForm mode="create" />
    </div>
  );
}