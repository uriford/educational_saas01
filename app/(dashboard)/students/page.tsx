import StudentStatistics from "@/features/students/components/StudentStatistics";
import StudentsPageHeader from "./StudentsPageHeader";
import { getStudentStatisticsAction } from "@/features/students/actions/get-student-statistics.action";

import StudentSearch from "@/features/students/components/StudentSearch";
import StudentTable from "@/features/students/components/StudentTable";

import { getStudentsAction } from "@/features/students/actions/get-students.action";
import Pagination from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function StudentsPage({ searchParams }: Props) {
  const { search = "", page = "1" } = await searchParams;

  const result = await getStudentsAction(search, Number(page));
  const statistics = await getStudentStatisticsAction();
  return (
    <div className="space-y-6">
      <StudentsPageHeader />
      <StudentStatistics statistics={statistics} />
      <StudentSearch />

      <StudentTable students={result.students} />

      {/* Pagination component will go here */}
      <Pagination
  currentPage={result.page}
  totalPages={result.totalPages}
  search={search}
  basePath="/students"
/>
    </div>
  );
}
