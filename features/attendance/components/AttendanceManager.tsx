"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileQuestion,
  Search,
  Save,
  StickyNote,
  X,
} from "lucide-react";

import { saveAttendanceAction } from "../actions/save-attendance.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const PAGE_SIZE = 50;

const statuses: {
  value: Status;
  label: string;
  shortLabel: string;
  icon: typeof Check;
}[] = [
  {
    value: "PRESENT",
    label: "Present",
    shortLabel: "P",
    icon: Check,
  },
  {
    value: "ABSENT",
    label: "Absent",
    shortLabel: "A",
    icon: X,
  },
  {
    value: "LATE",
    label: "Late",
    shortLabel: "L",
    icon: Clock3,
  },
  {
    value: "EXCUSED",
    label: "Excused",
    shortLabel: "E",
    icon: FileQuestion,
  },
];

const filters: {
  value: Status | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "All students" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
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

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Status | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [openNote, setOpenNote] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const recordMap = useMemo(
    () =>
      new Map(
        records.map((record) => [
          record.studentId,
          record,
        ]),
      ),
    [records],
  );

  const counts = useMemo(
    () => ({
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
    }),
    [records],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const record = recordMap.get(student.id);

      if (!record) return false;

      const matchesStatus =
        filter === "ALL" || record.status === filter;

      if (!matchesStatus) return false;

      if (!query) return true;

      const fullName =
        `${student.firstName} ${student.lastName ?? ""}`
          .trim()
          .toLowerCase();

      return (
        fullName.includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    });
  }, [filter, recordMap, search, students]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const markedCount = records.length;
  const unmarkedCount = Math.max(
    students.length - markedCount,
    0,
  );

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

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilter(value: Status | "ALL") {
    setFilter(value);
    setPage(1);
  }

  function markAll(status: Status) {
    setRecords((current) =>
      current.map((record) => ({
        ...record,
        status,
      })),
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const result = await saveAttendanceAction({
        classSessionId,
        records: records.map((record) => ({
          studentId: record.studentId,
          status: record.status,
          notes: record.notes || null,
        })),
      });

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    } catch {
      setMessage(
        "Something went wrong while saving attendance.",
      );
    } finally {
      setSaving(false);
    }
  }

  const showingFrom =
    filteredStudents.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const showingTo = Math.min(
    currentPage * PAGE_SIZE,
    filteredStudents.length,
  );

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Attendance
        </h1>

        <p className="text-sm text-muted-foreground">
          {courseName} · {sessionTitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Students
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {students.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Present
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.PRESENT}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Absent
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.ABSENT}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Late
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.LATE}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Excused
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {counts.EXCUSED}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-base">
                Students
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                {markedCount} of {students.length} students
                ready to save
                {unmarkedCount > 0 &&
                  ` · ${unmarkedCount} unmarked`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAll("PRESENT")}
                disabled={students.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all present
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Search by student name or ID..."
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                handleFilter(
                  event.target.value as Status | "ALL",
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              aria-label="Filter attendance"
            >
              {filters.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No active students are enrolled in this course.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No students found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try a different name, student ID, or status
                filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="sticky top-0 z-10 grid grid-cols-[48px_minmax(240px,1fr)_130px_190px_48px] items-center gap-3 border-b bg-background px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <div>#</div>
                    <div>Student</div>
                    <div>Student ID</div>
                    <div>Attendance</div>
                    <div />
                  </div>

                  <div className="divide-y">
                    {paginatedStudents.map(
                      (student, index) => {
                        const record = recordMap.get(
                          student.id,
                        );

                        if (!record) return null;

                        const globalIndex =
                          (currentPage - 1) * PAGE_SIZE +
                          index +
                          1;

                        return (
                          <div
                            key={student.id}
                            className="group grid grid-cols-[48px_minmax(240px,1fr)_130px_190px_48px] items-center gap-3 px-4 py-3 transition hover:bg-muted/30"
                          >
                            <div className="text-xs tabular-nums text-muted-foreground">
                              {String(
                                globalIndex,
                              ).padStart(2, "0")}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {student.firstName}{" "}
                                {student.lastName ?? ""}
                              </p>

                              {record.notes && (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {record.notes}
                                </p>
                              )}
                            </div>

                            <div className="truncate text-xs text-muted-foreground">
                              {student.studentId}
                            </div>

                            <div className="flex items-center gap-1">
                              {statuses.map(
                                (status) => {
                                  const Icon =
                                    status.icon;
                                  const active =
                                    record.status ===
                                    status.value;

                                  return (
                                    <button
                                      key={
                                        status.value
                                      }
                                      type="button"
                                      onClick={() =>
                                        updateStatus(
                                          student.id,
                                          status.value,
                                        )
                                      }
                                      title={
                                        status.label
                                      }
                                      aria-label={`${status.label} for ${student.firstName} ${student.lastName ?? ""}`}
                                      aria-pressed={
                                        active
                                      }
                                      className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition ${
                                        active
                                          ? "border-foreground bg-foreground text-background shadow-sm"
                                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                      }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </button>
                                  );
                                },
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setOpenNote(
                                  openNote ===
                                    student.id
                                    ? null
                                    : student.id,
                                )
                              }
                              title={
                                record.notes
                                  ? "Edit note"
                                  : "Add note"
                              }
                              aria-label={
                                record.notes
                                  ? "Edit note"
                                  : "Add note"
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                                record.notes
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <StickyNote className="h-4 w-4" />
                            </button>

                            {openNote ===
                              student.id && (
                              <div className="col-span-full border-t pt-3">
                                <Textarea
                                  autoFocus
                                  value={record.notes}
                                  onChange={(event) =>
                                    updateNotes(
                                      student.id,
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Optional note about this attendance..."
                                  className="min-h-20 resize-none text-sm"
                                />
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {showingFrom}
                  </span>
                  {"–"}
                  <span className="font-medium text-foreground">
                    {showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filteredStudents.length}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage((value) =>
                        Math.max(1, value - 1),
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="min-w-20 text-center text-xs text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {totalPages}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setPage((value) =>
                        Math.min(
                          totalPages,
                          value + 1,
                        ),
                      )
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-[var(--sidebar-width,0px)]">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {message ? (
              <p
                className={`truncate text-sm ${
                  message.includes("successfully")
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {students.length} students ·{" "}
                {counts.PRESENT} present ·{" "}
                {counts.ABSENT} absent ·{" "}
                {counts.LATE} late ·{" "}
                {counts.EXCUSED} excused
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="shrink-0"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? "Saving Attendance..."
              : "Save Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
