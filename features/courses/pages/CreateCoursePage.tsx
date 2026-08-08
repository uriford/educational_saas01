import CourseForm from "../components/CourseForm";

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Course
        </h1>

        <p className="text-sm text-muted-foreground">
          Create a new course for your organization.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <CourseForm mode="create" />
      </div>
    </div>
  );
}