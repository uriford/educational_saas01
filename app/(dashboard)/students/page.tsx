import Link from "next/link";
import StudentStatistics from "@/features/students/components/StudentStatistics";
import { getStudentStatisticsAction } from "@/features/students/actions/get-student-statistics.action";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage students and their enrollment information.
          </p>
        </div>

        <Link href="/students/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            Add Student
          </Button>
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
  basePath="/students"
/>
    </div>
  );
}
