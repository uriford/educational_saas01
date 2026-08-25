"use client";

import { useMemo, useState } from "react";

import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserX,
  Users,
} from "lucide-react";

import {
  createGuardianAction,
  deleteGuardianAction,
  updateGuardianAction,
  updateGuardianStatusAction,
} from "../actions/guardian.actions";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

type Student = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type Branch = {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isHeadquarters: boolean;
  status: string;
  createdAt: Date;
};

type Guardian = {
  id: string;
  code: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  avatar: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  guardianProfile: {
    id: string;
    students: {
      id: string;
      relationship: string | null;
      student: {
        id: string;
        studentId: string;
        firstName: string;
        lastName: string | null;
      };
    }[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialGuardians: Guardian[];
  initialBranches: Branch[];
  initialStudents: Student[];
  actorRole: string;
  actorBranchId: string | null;
};

function getName(person: {
  firstName: string;
  lastName?: string | null;
}) {
  return [person.firstName, person.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(person: {
  firstName: string;
  lastName?: string | null;
}) {
  return `${person.firstName?.[0] ?? ""}${
    person.lastName?.[0] ?? ""
  }`.toUpperCase();
}

function formatDate(date: Date | null) {
  if (!date) return "Never";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function GuardianManagement({
  initialGuardians,
  initialBranches,
  initialStudents,
  actorRole,
  actorBranchId,
}: Props) {
  const [guardians, setGuardians] =
    useState<Guardian[]>(initialGuardians);

  const [branches] =
    useState<Branch[]>(initialBranches);

  const [students] =
    useState<Student[]>(initialStudents);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingGuardian, setEditingGuardian] =
    useState<Guardian | null>(null);

  const [menuId, setMenuId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [busyId, setBusyId] =
    useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] =
    useState(actorBranchId ?? "");

  const [selectedStudents, setSelectedStudents] =
    useState<
      {
        studentId: string;
        relationship: string;
      }[]
    >([]);

  const [studentSearch, setStudentSearch] =
    useState("");

  const availableBranches =
    actorRole === "BRANCH_ADMIN"
      ? branches.filter(
          (branch) => branch.id === actorBranchId,
        )
      : branches;

  const availableStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      if (branchId && student.branchId !== branchId) {
        return false;
      }

      if (!query) return true;

      return [
        student.firstName,
        student.lastName,
        student.studentId,
        student.branch?.name,
        student.branch?.code,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        );
    });
  }, [students, branchId, studentSearch]);

  const filteredGuardians = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return guardians;

    return guardians.filter((guardian) =>
      [
        guardian.firstName,
        guardian.lastName,
        guardian.email,
        guardian.phone,
        guardian.code,
        guardian.branch?.name,
        guardian.branch?.code,
        ...(guardian.guardianProfile?.students ?? []).flatMap(
          ({ student }) => [
            student.firstName,
            student.lastName,
            student.studentId,
          ],
        ),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        ),
    );
  }, [guardians, search]);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");

    setBranchId(
      actorRole === "BRANCH_ADMIN"
        ? actorBranchId ?? ""
        : "",
    );

    setSelectedStudents([]);
    setStudentSearch("");
  }

  function openCreate() {
    resetForm();
    setEditingGuardian(null);
    setShowForm(true);
    setMessage(null);
  }

  function openEdit(guardian: Guardian) {
    setEditingGuardian(guardian);
    setShowForm(true);
    setMessage(null);

    setFirstName(guardian.firstName);
    setLastName(guardian.lastName ?? "");
    setEmail(guardian.email);
    setPhone(guardian.phone ?? "");
    setBranchId(guardian.branchId ?? "");

    setSelectedStudents(
      (guardian.guardianProfile?.students ?? []).map(
        ({ student, relationship }) => ({
          studentId: student.id,
          relationship: relationship ?? "",
        }),
      ),
    );
  }

  function closeForm() {
    setShowForm(false);
    setEditingGuardian(null);
    resetForm();
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((current) => {
      const existing = current.find(
        (item) => item.studentId === studentId,
      );

      if (existing) {
        return current.filter(
          (item) => item.studentId !== studentId,
        );
      }

      return [
        ...current,
        {
          studentId,
          relationship: "",
        },
      ];
    });
  }

  function updateRelationship(
    studentId: string,
    relationship: string,
  ) {
    setSelectedStudents((current) =>
      current.map((item) =>
        item.studentId === studentId
          ? { ...item, relationship }
          : item,
      ),
    );
  }

  async function handleCreate() {
    if (!firstName.trim()) {
      setMessage({
        type: "error",
        text: "First name is required.",
      });
      return;
    }

    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Email is required.",
      });
      return;
    }

    if (!branchId) {
      setMessage({
        type: "error",
        text: "A branch is required.",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      setMessage({
        type: "error",
        text: "Select at least one student.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await createGuardianAction({
        firstName,
        lastName,
        email,
        phone,
        branchId,
        students: selectedStudents,
      });

      setGuardians((current) => [
        ...current,
        result.guardian as Guardian,
      ]);

      setMessage({
        type: "success",
        text: `Guardian created successfully. Temporary password: ${result.temporaryPassword}`,
      });

      setShowForm(false);
      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to create guardian.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingGuardian) return;

    if (!firstName.trim()) {
      setMessage({
        type: "error",
        text: "First name is required.",
      });
      return;
    }

    if (!branchId) {
      setMessage({
        type: "error",
        text: "A branch is required.",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      setMessage({
        type: "error",
        text: "Select at least one student.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await updateGuardianAction(
        editingGuardian.id,
        {
          firstName,
          lastName,
          phone,
          branchId,
          students: selectedStudents,
        },
      );

      if (!result) {
        throw new Error("Guardian could not be updated.");
      }

      setGuardians((current) =>
        current.map((guardian) =>
          guardian.id === editingGuardian.id
            ? {
                ...guardian,
                firstName,
                lastName: lastName || null,
                phone: phone || null,
                branchId,
                branch:
                  branches.find(
                    (branch) => branch.id === branchId,
                  ) ?? guardian.branch,
              }
            : guardian,
        ),
      );

      setMessage({
        type: "success",
        text: "Guardian updated successfully.",
      });

      closeForm();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update guardian.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(guardian: Guardian) {
    const nextStatus =
      guardian.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    setBusyId(guardian.id);
    setMessage(null);

    try {
      await updateGuardianStatusAction({
        guardianId: guardian.id,
        status: nextStatus,
      });

      setGuardians((current) =>
        current.map((item) =>
          item.id === guardian.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      setMessage({
        type: "success",
        text:
          nextStatus === "ACTIVE"
            ? "Guardian activated successfully."
            : "Guardian suspended successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update guardian status.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(guardian: Guardian) {
    const confirmed = window.confirm(
      `Delete ${getName(guardian)}? This will remove the guardian account from active records.`,
    );

    if (!confirmed) return;

    setBusyId(guardian.id);
    setMessage(null);

    try {
      await deleteGuardianAction(guardian.id);

      setGuardians((current) =>
        current.filter(
          (item) => item.id !== guardian.id,
        ),
      );

      setMessage({
        type: "success",
        text: "Guardian deleted successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete guardian.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Guardians
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage guardian accounts and their linked students.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guardian
        </Button>
      </div>

      {message && (
        <Card
          className={
            message.type === "success"
              ? "border-green-500/30 bg-green-500/5"
              : "border-destructive/30 bg-destructive/5"
          }
        >
          <CardContent className="flex items-center gap-3 py-4">
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <UserX className="h-5 w-5 text-destructive" />
            )}

            <p className="text-sm">{message.text}</p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingGuardian
                    ? "Edit Guardian"
                    : "Create Guardian"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {editingGuardian
                    ? "Update guardian information and linked students."
                    : "Create a guardian account and link one or more students."}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={closeForm}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  Guardian information
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Basic account and contact information.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  disabled={Boolean(editingGuardian)}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="guardian@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+880..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Branch</Label>

                <div className="relative">
                  <select
                    value={branchId}
                    onChange={(event) => {
                      setBranchId(event.target.value);
                      setSelectedStudents([]);
                    }}
                    className="h-11 w-full rounded-lg border-border/70 bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                    disabled={
                      actorRole === "BRANCH_ADMIN"
                    }
                  >
                    <option value="">
                      Select branch
                    </option>

                    {availableBranches.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name} ({branch.code})
                        {branch.isHeadquarters
                          ? " — Headquarters"
                          : ""}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 opacity-50" />
                </div>
              </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Building2 className="h-4 w-4 text-primary" />
                  Branch assignment
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Choose the guardian&apos;s primary branch. Linked students can
                  still display their own branch below.
                </p>
              </div>

              <div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select every student this guardian is responsible for.
                </p>
              </div>

              {selectedStudents.length > 0 && (
                <div className="space-y-2 rounded-xl border border-primary/10 bg-background p-3 shadow-sm">
                  {selectedStudents.map((selected) => {
                    const student = students.find(
                      (item) =>
                        item.id === selected.studentId,
                    );

                    if (!student) return null;

                    return (
                      <div
                        key={student.id}
                        className="flex flex-col gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {getInitials(student)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {getName(student)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.studentId}
                            </p>
                          </div>
                        </div>

                        <Input
                          value={selected.relationship}
                          onChange={(event) =>
                            updateRelationship(
                              student.id,
                              event.target.value,
                            )
                          }
                          placeholder="Relationship e.g. Father"
                          className="sm:w-52"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStudent(student.id)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Input
                value={studentSearch}
                onChange={(event) =>
                  setStudentSearch(event.target.value)
                }
                placeholder="Search by student name or ID..."
              />

              <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border bg-background p-2 shadow-sm">
                {!branchId ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    Select a branch to see available students.
                  </p>
                ) : availableStudents.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No active students found.
                  </p>
                ) : (
                  availableStudents.map((student) => {
                    const selected =
                      selectedStudents.some(
                        (item) =>
                          item.studentId === student.id,
                      );

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() =>
                          toggleStudent(student.id)
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-all ${
                          selected
                            ? "border-primary/20 bg-primary/10 shadow-sm"
                            : "hover:border-border hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {selected && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>

                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(student)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {getName(student)}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{student.studentId}</span>

                            {student.branch && (
                              <>
                                <span aria-hidden="true">•</span>
                                <span className="rounded-full bg-muted px-2 py-0.5">
                                  {student.branch.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="-mx-6 -mb-6 mt-2 flex flex-col-reverse gap-2 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="h-10 rounded-lg px-5"
                onClick={closeForm}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                onClick={
                  editingGuardian
                    ? handleUpdate
                    : handleCreate
                }
                disabled={loading}
                className="h-10 rounded-lg px-5 shadow-sm"
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {editingGuardian
                  ? "Save Changes"
                  : "Create Guardian"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Guardian Accounts
              </h2>

              <p className="text-sm text-muted-foreground">
                {filteredGuardians.length} guardian
                {filteredGuardians.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search guardians..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-visible">
          {filteredGuardians.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <ShieldCheck className="mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-medium">
                {search
                  ? "No guardians found"
                  : "No guardians yet"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different search."
                  : "Create your first guardian account to get started."}
              </p>

              {!search && (
                <Button
                  className="mt-4"
                  onClick={openCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guardian
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuardians.map((guardian) => {
                const linkedStudents =
                  guardian.guardianProfile?.students ?? [];

                return (
                  <div
                    key={guardian.id}
                    className="group rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback>
                            {getInitials(guardian)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {getName(guardian)}
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                guardian.status === "ACTIVE"
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {guardian.status}
                            </span>
                          </div>

                          <p className="truncate text-sm text-muted-foreground">
                            {guardian.email}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {guardian.code}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-44">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Branch
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {guardian.branch?.name ??
                                "Unassigned"}
                            </p>
                            {guardian.branch?.code && (
                              <p className="text-[11px] text-muted-foreground">
                                {guardian.branch.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-56">
                        <p className="text-xs text-muted-foreground">
                          Linked Students
                        </p>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {linkedStudents.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              None
                            </span>
                          ) : (
                            linkedStudents
                              .slice(0, 3)
                              .map(
                                ({
                                  id,
                                  student,
                                  relationship,
                                }) => (
                                  <span
                                    key={id}
                                    className="rounded-md border bg-muted/60 px-2 py-1 text-xs"
                                    title={
                                      relationship ??
                                      undefined
                                    }
                                  >
                                    {getName(student)}
                                  </span>
                                ),
                              )
                          )}

                          {linkedStudents.length > 3 && (
                            <span className="rounded-md bg-muted px-2 py-1 text-xs">
                              +{linkedStudents.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm lg:w-32">
                        <p className="text-xs text-muted-foreground">
                          Last login
                        </p>
                        <p className="text-xs">
                          {formatDate(
                            guardian.lastLoginAt,
                          )}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={busyId === guardian.id}
                          aria-label={`Actions for ${getName(guardian)}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all outline-none hover:border-border hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-open:border-border data-open:bg-muted data-open:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          {busyId === guardian.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          sideOffset={8}
                          className="w-52 rounded-xl p-1.5 shadow-xl"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg px-3 py-2.5"
                            onClick={() => openEdit(guardian)}
                          >
                            <Pencil className="mr-2.5 h-4 w-4" />
                            Edit guardian
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg px-3 py-2.5"
                            onClick={() => handleStatus(guardian)}
                          >
                            {guardian.status === "ACTIVE" ? (
                              <UserX className="mr-2.5 h-4 w-4" />
                            ) : (
                              <ShieldCheck className="mr-2.5 h-4 w-4" />
                            )}

                            {guardian.status === "ACTIVE"
                              ? "Suspend guardian"
                              : "Activate guardian"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1.5" />

                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg px-3 py-2.5 text-destructive focus:text-destructive"
                            onClick={() => handleDelete(guardian)}
                          >
                            <Trash2 className="mr-2.5 h-4 w-4" />
                            Delete guardian
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
