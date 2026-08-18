import Link from "next/link";
import { Plus } from "lucide-react";

import { requireAdmin } from "@/features/auth/authorization";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/common/Pagination";

import { TeacherService } from "@/features/teachers/services/teacher.service";

import TeacherSearch from "@/features/teachers/components/TeacherSearch";
import TeacherTable from "@/features/teachers/components/TeacherTable";
import TeacherStatistics from "@/features/teachers/components/TeacherStatistics";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function TeachersPage({
  searchParams,
}: Props) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return null;
  }

  const params = await searchParams;

  const search = params.search ?? "";

  const currentPage = Math.max(
    1,
    Number(params.page ?? "1") || 1,
  );

  const branchId =
    session.user.branchId ?? undefined;

  const [result, statistics] =
    await Promise.all([
      TeacherService.getAll(
        session.user.organizationId,
        branchId,
        search,
        currentPage,
        10,
      ),

      TeacherService.getStatistics(
        session.user.organizationId,
        branchId,
      ),
    ]);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Teachers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
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

      {/* Statistics */}
      <TeacherStatistics
        total={statistics.total}
        active={statistics.active}
        inactive={statistics.inactive}
        onLeave={statistics.onLeave}
        resigned={statistics.resigned}
        newThisMonth={statistics.newThisMonth}
      />

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            All Teachers
          </h2>

          <p className="text-sm text-muted-foreground">
            Search and manage your teaching staff.
          </p>
        </div>

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