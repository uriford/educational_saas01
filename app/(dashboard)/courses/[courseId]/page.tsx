import { requireAdmin } from "@/features/auth/authorization";
import CourseDetailsPage from "@/features/courses/pages/CourseDetailsPage";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function Page({ params }: Props) {
  await requireAdmin();

  const { courseId } = await params;

  return <CourseDetailsPage courseId={courseId} />;
}
