import Link from "next/link";

import { Button } from "@/components/ui/button";

import TeacherSearch from "@/features/teachers/components/TeacherSearch";
import TeacherTable from "@/features/teachers/components/TeacherTable";
import Pagination from "@/features/students/components/Pagination";

import { getTeachersAction } from "@/features/teachers/actions/get-teachers.action";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function TeachersPage({
  searchParams,
}: Props) {
  const { search, page } = await searchParams;

  const result = await getTeachersAction(
    search,
    Number(page ?? 1),
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Teachers
          </h1>

          <p className="text-muted-foreground">
            Manage all teachers.
          </p>
        </div>

        <Link href="/teachers/create">
          <Button>Add Teacher</Button>
        </Link>

      </div>

      <TeacherSearch />

      <TeacherTable
        teachers={result.teachers}
      />

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        search={search}
      />

    </div>
  );
}