import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";
import EditAssessmentForm from "@/features/assessments/components/EditAssessmentForm";

type Props = {
  params: Promise<{
    courseId: string;
    assessmentId: string;
  }>;
};

export default async function EditAssessmentPage({
  params,
}: Props) {
  const session = await requireAdmin();

  const { courseId, assessmentId } = await params;

  if (!session.user.organizationId) {
    notFound();
  }

  const organizationId = session.user.organizationId;
  const branchId = session.user.branchId ?? undefined;

  const course = await CourseService.getById(
    courseId,
    organizationId,
    branchId,
  );

  if (!course) {
    notFound();
  }

  const assessment = await AssessmentService.getById(
    assessmentId,
    organizationId,
    branchId,
  );

  if (!assessment || assessment.courseId !== courseId) {
    notFound();
  }

  const plainAssessment = {
    id: assessment.id,
    courseId: assessment.courseId,
    title: assessment.title,
    description: assessment.description,
    duration: assessment.duration,
    totalMarks: Number(assessment.totalMarks),
    passingMarks: Number(assessment.passingMarks),
    maxAttempts: assessment.maxAttempts,
    status: assessment.status,
    startDate: assessment.startDate
      ? assessment.startDate.toISOString()
      : null,
    endDate: assessment.endDate
      ? assessment.endDate.toISOString()
      : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the assessment settings for {course.name}.
        </p>
      </div>

      <EditAssessmentForm assessment={plainAssessment} />
    </div>
  );
}