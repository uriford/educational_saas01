import Link from "next/link";
import StudentStatistics from "@/features/students/components/StudentStatistics";
import { getStudentStatisticsAction } from "@/features/students/actions/get-student-statistics.action";
import { Button } from "@/components/ui/button";

import StudentSearch from "@/features/students/components/StudentSearch";
import StudentTable from "@/features/students/components/StudentTable";

import { getStudentsAction } from "@/features/students/actions/get-students.action";
import Pagination from "@/features/students/components/Pagination";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>

        <Link href="/students/create">
          <Button>Add Student</Button>
        </Link>
      </div>
      <StudentStatistics statistics={statistics} />
      <StudentSearch />

      <StudentTable students={result.students} />

      {/* Pagination component will go here */}
      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        search={search}
      />
    </div>
  );
}
