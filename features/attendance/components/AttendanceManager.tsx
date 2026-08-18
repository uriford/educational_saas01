"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, FileQuestion, Save, X } from "lucide-react";

import { saveAttendanceAction } from "../actions/save-attendance.action";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Status =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

type Student = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
};

type AttendanceRecord = {
  studentId: string;
  status: Status;
  notes: string;
};

type Props = {
  classSessionId: string;
  courseName: string;
  sessionTitle: string;
  students: Student[];
  existingAttendance: {
    studentId: string;
    status: Status;
    notes: string | null;
  }[];
};

const statuses: {
  value: Status;
  label: string;
  icon: typeof Check;
}[] = [
  {
    value: "PRESENT",
    label: "Present",
    icon: Check,
  },
  {
    value: "ABSENT",
    label: "Absent",
    icon: X,
  },
  {
    value: "LATE",
    label: "Late",
    icon: Clock3,
  },
  {
    value: "EXCUSED",
    label: "Excused",
    icon: FileQuestion,
  },
];

export default function AttendanceManager({
  classSessionId,
  courseName,
  sessionTitle,
  students,
  existingAttendance,
}: Props) {
  const router = useRouter();

  const [records, setRecords] =
    useState<AttendanceRecord[]>(() =>
      students.map((student) => {
        const existing = existingAttendance.find(
          (item) => item.studentId === student.id,
        );

        return {
          studentId: student.id,
          status: existing?.status ?? "PRESENT",
          notes: existing?.notes ?? "",
        };
      }),
    );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateStatus(
    studentId: string,
    status: Status,
  ) {
    setRecords((current) =>
      current.map((record) =>
        record.studentId === studentId
          ? { ...record, status }
          : record,
      ),
    );
  }

  function updateNotes(
    studentId: string,
    notes: string,
  ) {
    setRecords((current) =>
      current.map((record) =>
        record.studentId === studentId
          ? { ...record, notes }
          : record,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const result = await saveAttendanceAction({
      classSessionId,
      records: records.map((record) => ({
        studentId: record.studentId,
        status: record.status,
        notes: record.notes || null,
      })),
    });

    setMessage(result.message);
    setSaving(false);

    if (result.success) {
      router.refresh();
    }
  }

  const counts = {
    PRESENT: records.filter(
      (record) => record.status === "PRESENT",
    ).length,
    ABSENT: records.filter(
      (record) => record.status === "ABSENT",
    ).length,
    LATE: records.filter(
      (record) => record.status === "LATE",
    ).length,
    EXCUSED: records.filter(
      (record) => record.status === "EXCUSED",
    ).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Attendance
        </h1>

        <p className="text-sm text-muted-foreground">
          {courseName} · {sessionTitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Present
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.PRESENT}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Absent
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.ABSENT}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Late
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.LATE}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Excused
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.EXCUSED}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Students ({students.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No active students are enrolled in this course.
            </div>
          ) : (
            <div className="divide-y">
              {students.map((student) => {
                const record = records.find(
                  (item) =>
                    item.studentId === student.id,
                );

                if (!record) return null;

                return (
                  <div
                    key={student.id}
                    className="flex flex-col gap-4 p-5"
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">
                          {student.firstName}{" "}
                          {student.lastName ?? ""}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {student.studentId}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {statuses.map((status) => {
                          const Icon = status.icon;
                          const active =
                            record.status ===
                            status.value;

                          return (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  student.id,
                                  status.value,
                                )
                              }
                              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                active
                                  ? "border-foreground bg-foreground text-background"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {status.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Textarea
                      value={record.notes}
                      onChange={(event) =>
                        updateNotes(
                          student.id,
                          event.target.value,
                        )
                      }
                      placeholder="Optional note..."
                      className="min-h-20"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            message.includes("successfully")
              ? "text-green-600"
              : "text-destructive"
          }`}
        >
          {message}
        </p>

        <Button
          onClick={handleSave}
          disabled={saving || students.length === 0}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving
            ? "Saving Attendance..."
            : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
}
