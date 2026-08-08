import { notFound } from "next/navigation";

import { auth } from "@/auth";
import CourseForm from "@/features/courses/components/CourseForm";
import { CourseService } from "@/features/courses/services/course.service";


type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function EditCoursePage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const { courseId } = await params;

  const course = await CourseService.getById(
    courseId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Edit Course
        </h2>

        <p className="text-sm text-muted-foreground">
          Update the information and schedule for this course.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <CourseForm
          mode="edit"
          courseId={course.id}
          defaultValues={{
            code: course.code,
            name: course.name,
            description: course.description ?? "",
            duration: course.duration ?? undefined,
            fee: course.fee ? Number(course.fee) : undefined,
            capacity: course.capacity ?? undefined,
            startDate: course.startDate
              ? course.startDate.toISOString().split("T")[0]
              : "",
            endDate: course.endDate
              ? course.endDate.toISOString().split("T")[0]
              : "",
            status: course.status,
          }}
        />
      </div>
    </div>
  );
}