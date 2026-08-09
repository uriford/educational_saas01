import EnrollStudentPage from "@/features/course-enrollments/pages/EnrollStudentPage";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { courseId } = await params;

  return <EnrollStudentPage courseId={courseId} />;
}
