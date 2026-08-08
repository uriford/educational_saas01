import Link from "next/link";
import { Eye, Pencil, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";

import DeleteTeacherButton from "./DeleteTeacherButton";

import type { TeacherTableItem } from "../types";

type Props = {
  teachers: TeacherTableItem[];
};

export default function TeacherTable({ teachers }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[700px]">
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
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10">
                <div className="flex flex-col items-center gap-3 text-center">
                  <UserCircle2
                    size={60}
                    className="text-muted-foreground"
                  />

                  <p className="font-medium">
                    No teachers found
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Create your first teacher to get started.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCircle2
                      size={34}
                      className="shrink-0 text-muted-foreground"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {teacher.firstName}{" "}
                        {teacher.lastName ?? ""}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {teacher.teacherId}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {teacher.phone ?? "-"}
                </td>

                <td className="p-4">
                  {teacher.designation ?? "-"}
                </td>

                <td className="p-4">
                  <StatusBadge status={teacher.status} />
                </td>

                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <Link href={`/teachers/${teacher.id}`}>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="View teacher"
                      >
                        <Eye size={18} />
                      </Button>
                    </Link>

                    <Link href={`/teachers/${teacher.id}/edit`}>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit teacher"
                      >
                        <Pencil size={18} />
                      </Button>
                    </Link>

                    <DeleteTeacherButton
                      teacherId={teacher.id}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}