"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Search, UserCircle2 } from "lucide-react";

import type { Student } from "@prisma/client";

import { enrollStudentByAdminAction } from "../actions/enroll-student-by-admin.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import StatusBadge from "@/components/common/StatusBadge";

type Props = {
  courseId: string;
  students: Student[];
};

export default function EnrollStudentForm({
  courseId,
  students,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [loadingStudentId, setLoadingStudentId] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    const fullName =
      `${student.firstName} ${student.lastName ?? ""}`.toLowerCase();

    return (
      fullName.includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.phone?.toLowerCase().includes(query)
    );
  });

  async function handleEnroll(studentId: string) {
    setLoadingStudentId(studentId);
    setMessage("");

    const result = await enrollStudentByAdminAction(
      studentId,
      courseId,
    );

    setLoadingStudentId(null);
    setMessage(result.message);

    if (result.success) {
      router.push(`/courses/${courseId}`);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="font-semibold">
            Select Student
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Search for a student and enroll them in this course.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, student ID or phone..."
            className="pl-9"
          />
        </div>

        {message && (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            {message}
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <UserCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No students found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserCircle2 className="h-9 w-9 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {student.firstName}{" "}
                      {student.lastName ?? ""}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {student.studentId}
                      {student.phone
                        ? ` • ${student.phone}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={student.status} />

                  <Button
                    size="sm"
                    disabled={
                      loadingStudentId === student.id
                    }
                    onClick={() =>
                      handleEnroll(student.id)
                    }
                  >
                    {loadingStudentId === student.id ? (
                      "Enrolling..."
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Enroll
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
