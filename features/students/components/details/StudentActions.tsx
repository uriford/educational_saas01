import Link from "next/link";

import {
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  studentId: string;
};

export default function StudentActions({
  studentId,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

      <Link href="/students">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Link href={`/students/${studentId}/edit`}>
        <Button className="w-full sm:w-auto">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Student
        </Button>
      </Link>

      <Button
        variant="destructive"
        className="w-full sm:w-auto"
        disabled
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

    </div>
  );
}