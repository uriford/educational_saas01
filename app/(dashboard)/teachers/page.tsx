import Link from "next/link";

import { Plus } from "lucide-react";

import { auth } from "@/auth";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/common/Pagination";

import { TeacherService } from "@/features/teachers/services/teacher.service";

import TeacherSearch from "@/features/teachers/components/TeacherSearch";
import TeacherTable from "@/features/teachers/components/TeacherTable";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function TeachersPage({
  searchParams,
}: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return null;
  }

  const params = await searchParams;

  const search = params.search ?? "";

  const currentPage = Math.max(
    1,
    Number(params.page ?? "1") || 1,
  );

  const result = await TeacherService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    search,
    currentPage,
    10,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teachers
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage teachers and their information.
          </p>
        </div>

        <Link href="/teachers/create">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TeacherSearch />
      </div>

      {/* Table */}
      <TeacherTable teachers={result.teachers} />

      {/* Pagination */}
      <Pagination
  currentPage={result.page}
  totalPages={result.totalPages}
  search={search}
  basePath="/teachers"
/>
    </div>
  );
}