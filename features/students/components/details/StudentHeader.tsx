import Link from "next/link";

import {
  ArrowLeft,
  Pencil,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import StatusBadge from "@/components/common/StatusBadge";

import type{ StudentDetails} from "../../types/index";

type Props = {
  student: StudentDetails;
};

export default function StudentHeader({
  student,
}: Props) {
  const initials = `${student.firstName[0] ?? ""}${student.lastName?.[0] ?? ""}`;

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">

          <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-md">
            <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {student.firstName} {student.lastName ?? ""}
              </h1>

              <StatusBadge status={student.status} />
            </div>

            <p className="text-muted-foreground">
              Student ID
            </p>

            <p className="font-semibold tracking-wide">
              {student.studentId}
            </p>

          </div>

        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

          <Link href="/students">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/students/${student.id}/edit`}>
            <Button className="w-full sm:w-auto">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </Link>

        </div>

      </div>
    </div>
  );
}