import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { AssessmentService } from "@/features/assessments/services/assessment.service";

import CourseAssessments from "@/features/assessments/components/CourseAssessments";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AssessmentsPage({ params }: Props) {
  const session = await requireAdmin();

  const { courseId } = await params;

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

  const assessments =
    await AssessmentService.getCourseAssessments(
      courseId,
      organizationId,
      branchId,
    );

  const plainAssessments = assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    duration: assessment.duration,
    totalMarks: Number(assessment.totalMarks),
    passingMarks: Number(assessment.passingMarks),
    maxAttempts: Number(assessment.maxAttempts),
    status: assessment.status,
    startDate: assessment.startDate
      ? assessment.startDate.toISOString()
      : null,
    endDate: assessment.endDate
      ? assessment.endDate.toISOString()
      : null,
  }));

  return (
    <CourseAssessments
      courseId={course.id}
      assessments={plainAssessments}
    />
  );
}