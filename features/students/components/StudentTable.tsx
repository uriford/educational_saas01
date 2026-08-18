import Link from "next/link";
import DeleteStudentButton from "./DeleteStudentButton";
import { Eye, Pencil } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import StatusBadge from "@/components/common/StatusBadge";

import { Button } from "@/components/ui/button";

import type { StudentTableItem } from "../types";

type Props = {
  students: StudentTableItem[];
};

function StudentIdentity({
  student,
}: {
  student: StudentTableItem;
}) {
  const fullName =
    `${student.firstName} ${student.lastName ?? ""}`.trim();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage alt={fullName} />
        <AvatarFallback className="text-xs font-semibold">
          {student.firstName?.[0] ?? ""}
          {student.lastName?.[0] ?? ""}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate font-medium">{fullName}</p>

        <p className="truncate text-xs text-muted-foreground">
          {student.studentId}
        </p>
      </div>
    </div>
  );
}

function StudentActions({
  studentId,
}: {
  studentId: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/students/${studentId}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9"
          aria-label="View student"
        >
          <Eye size={17} />
        </Button>
      </Link>

      <Link href={`/students/${studentId}/edit`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9"
          aria-label="Edit student"
        >
          <Pencil size={17} />
        </Button>
      </Link>

      <DeleteStudentButton studentId={studentId} />
    </div>
  );
}

export default function StudentTable({ students }: Props) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-medium">No students found</p>

          <p className="text-sm text-muted-foreground">
            Create your first student to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="space-y-3 sm:hidden">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <StudentIdentity student={student} />

              <StatusBadge status={student.status} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Phone
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {student.phone ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end border-t pt-3">
              <StudentActions studentId={student.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Tablet / Desktop */}
      <div className="hidden w-full overflow-x-auto rounded-xl border bg-card sm:block">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">
                Student
              </th>

              <th className="p-4 text-left font-medium">
                Phone
              </th>

              <th className="p-4 text-left font-medium">
                Status
              </th>

              <th className="p-4 text-left font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <td className="p-4">
                  <StudentIdentity student={student} />
                </td>

                <td className="p-4">
                  {student.phone ?? "-"}
                </td>

                <td className="p-4">
                  <StatusBadge status={student.status} />
                </td>

                <td className="p-4">
                  <StudentActions studentId={student.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
