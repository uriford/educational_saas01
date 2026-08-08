import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";

import type { TeacherDetails } from "../types";

type Props = {
  teacher: TeacherDetails;
};

export default function TeacherHeader({
  teacher,
}: Props) {
  const initials =
    `${teacher.firstName[0] ?? ""}${teacher.lastName?.[0] ?? ""}`;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4 sm:gap-6">
        <Avatar className="h-20 w-20 shrink-0 border-4 border-primary/10 shadow-md sm:h-24 sm:w-24">
          <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary sm:text-3xl">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {teacher.firstName}{" "}
              {teacher.lastName ?? ""}
            </h1>

            <StatusBadge status={teacher.status} />
          </div>

          <p className="text-sm text-muted-foreground">
            Teacher ID
          </p>

          <p className="font-semibold tracking-wide">
            {teacher.teacherId}
          </p>
        </div>
      </div>

      <div className="flex w-full gap-3 md:w-auto">
        <Link href="/teachers" className="flex-1 md:flex-none">
          <Button
            variant="outline"
            className="w-full md:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Link
          href={`/teachers/${teacher.id}/edit`}
          className="flex-1 md:flex-none"
        >
          <Button className="w-full md:w-auto">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        </Link>
      </div>
    </div>
  );
}