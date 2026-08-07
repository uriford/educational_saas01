import Link from "next/link";
import {
  Eye,
  Pencil,
  UserCircle2,
  Briefcase,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import StatusBadge from "@/components/common/StatusBadge";

import DeleteTeacherButton from "./DeleteTeacherButton";

import type { TeacherTableItem } from "../types";

type Props = {
  teachers: TeacherTableItem[];
};

export default function TeacherTable({
  teachers,
}: Props) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-xl border p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <UserCircle2
            size={64}
            className="text-muted-foreground"
          />

          <h3 className="text-lg font-semibold">
            No teachers found
          </h3>

          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first teacher to start managing
            your institute.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}

      <div className="hidden overflow-x-auto rounded-xl border lg:block">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-4">Teacher</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Status</th>
              <th className="w-40 p-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="border-t transition hover:bg-muted/40"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCircle2
                      size={38}
                      className="text-muted-foreground"
                    />

                    <div>
                      <p className="font-medium">
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
                  <StatusBadge
                    status={teacher.status}
                  />
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/teachers/${teacher.id}`}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                      >
                        <Eye size={18} />
                      </Button>
                    </Link>

                    <Link
                      href={`/teachers/${teacher.id}/edit`}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}

      <div className="space-y-4 lg:hidden">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <UserCircle2
                  size={42}
                  className="text-muted-foreground"
                />

                <div>
                  <h3 className="font-semibold">
                    {teacher.firstName}{" "}
                    {teacher.lastName ?? ""}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {teacher.teacherId}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={teacher.status}
              />
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone size={15} />
                <span>
                  {teacher.phone ?? "-"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={15} />
                <span>
                  {teacher.designation ?? "-"}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Link
                href={`/teachers/${teacher.id}`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                >
                  <Eye size={18} />
                </Button>
              </Link>

              <Link
                href={`/teachers/${teacher.id}/edit`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                >
                  <Pencil size={18} />
                </Button>
              </Link>

              <DeleteTeacherButton
                teacherId={teacher.id}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}