import Link from "next/link";
import DeleteStudentButton from "./DeleteStudentButton";
import { Eye, Pencil, Trash2, UserCircle2 } from "lucide-react";

import StatusBadge from "@/components/common/StatusBadge";

import { Button } from "@/components/ui/button";

import type { StudentTableItem } from "../types";

type Props = {
  students: StudentTableItem[];
};

export default function StudentTable({ students }: Props) {
  return (
    
   <div className="w-full overflow-x-auto rounded-xl border">
  <table className="min-w-[700px] w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left font-medium">Student</th>
            <th className="p-4 text-left font-medium">Phone</th>
            <th className="p-4 text-left font-medium">Status</th>
            <th className="p-4 text-left font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-10">
                <div className="flex flex-col items-center gap-3">
                  <UserCircle2 size={60} className="text-muted-foreground" />

                  <p className="font-medium">No students found</p>

                  <p className="text-sm text-muted-foreground">
                    Create your first student to get started.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr
                key={student.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCircle2 size={34} className="text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName ?? ""}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.studentId}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">{student.phone ?? "-"}</td>

                <td className="p-4">
                  <StatusBadge status={student.status} />
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/students/${student.id}`}>
                      <Button size="icon" variant="ghost">
                        <Eye size={18} />
                      </Button>
                    </Link>

                    <Link href={`/students/${student.id}/edit`}>
                      <Button size="icon" variant="ghost">
                        <Pencil size={18} />
                      </Button>
                    </Link>

                    <DeleteStudentButton studentId={student.id} />
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
