import Link from "next/link";
import { Eye, Pencil, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";

import DeleteTeacherButton from "./DeleteTeacherButton";

import type { TeacherTableItem } from "../types";

type Props = {
  teachers: TeacherTableItem[];
};

function TeacherName({
  teacher,
}: {
  teacher: TeacherTableItem;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserCircle2 className="h-10 w-10 shrink-0 text-muted-foreground" />

      <div className="min-w-0">
        <p className="truncate font-medium">
          {teacher.firstName} {teacher.lastName ?? ""}
        </p>

        <p className="text-xs text-muted-foreground">
          {teacher.teacherId}
        </p>
      </div>
    </div>
  );
}

function TeacherActions({
  teacher,
}: {
  teacher: TeacherTableItem;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/teachers/${teacher.id}`}>
        <Button
          size="icon"
          variant="ghost"
          aria-label="View teacher"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>

      <Link href={`/teachers/${teacher.id}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Edit teacher"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <DeleteTeacherButton teacherId={teacher.id} />
    </div>
  );
}

export default function TeacherTable({
  teachers,
}: Props) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <UserCircle2
            className="h-14 w-14 text-muted-foreground"
          />

          <p className="font-medium">
            No teachers found
          </p>

          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first teacher to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-4 text-left text-sm font-medium">
                  Teacher
                </th>

                <th className="p-4 text-left text-sm font-medium">
                  Phone
                </th>

                <th className="p-4 text-left text-sm font-medium">
                  Designation
                </th>

                <th className="p-4 text-left text-sm font-medium">
                  Status
                </th>

                <th className="p-4 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
                >
                  <td className="p-4">
                    <TeacherName teacher={teacher} />
                  </td>

                  <td className="p-4 text-sm">
                    {teacher.phone ?? "-"}
                  </td>

                  <td className="p-4 text-sm">
                    {teacher.designation ?? "-"}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={teacher.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end">
                      <TeacherActions teacher={teacher} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="space-y-3 md:hidden">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <TeacherName teacher={teacher} />

              <StatusBadge status={teacher.status} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Phone
                </p>

                <p className="mt-1 break-words text-sm">
                  {teacher.phone ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Designation
                </p>

                <p className="mt-1 break-words text-sm">
                  {teacher.designation ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end border-t pt-3">
              <TeacherActions teacher={teacher} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
