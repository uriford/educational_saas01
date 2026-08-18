"use client";

import { useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronDown,  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,  UserX,
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
    setMenuId(null);
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
    setMenuId(null);
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

          <CardContent className="space-y-6">
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
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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

            <div className="space-y-3">
              <div>
                <Label>Linked students</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select every student this guardian is responsible for.
                </p>
              </div>

              {selectedStudents.length > 0 && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                  {selectedStudents.map((selected) => {
                    const student = students.find(
                      (item) =>
                        item.id === selected.studentId,
                    );

                    if (!student) return null;

                    return (
                      <div
                        key={student.id}
                        className="flex flex-col gap-2 rounded-md border bg-background p-3 sm:flex-row sm:items-center"
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
                placeholder="Search students..."
              />

              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
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
                        className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors ${
                          selected
                            ? "bg-primary/10"
                            : "hover:bg-muted"
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
                          <p className="text-xs text-muted-foreground">
                            {student.studentId}
                            {student.branch
                              ? ` • ${student.branch.name}`
                              : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
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

      <Card>
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

        <CardContent>
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
                    className="rounded-xl border p-4 transition-shadow hover:shadow-sm"
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
                        <p className="text-xs text-muted-foreground">
                          Branch
                        </p>
                        <p className="text-sm font-medium">
                          {guardian.branch?.name ??
                            "Unassigned"}
                        </p>
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
                                    className="rounded-md bg-muted px-2 py-1 text-xs"
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

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setMenuId(
                              menuId === guardian.id
                                ? null
                                : guardian.id,
                            )
                          }
                          disabled={
                            busyId === guardian.id
                          }
                        >
                          {busyId === guardian.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>

                        {menuId === guardian.id && (
                          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border bg-popover p-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                openEdit(guardian);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit guardian
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatus(guardian)
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                              {guardian.status ===
                              "ACTIVE" ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(guardian)
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete guardian
                            </button>
                          </div>
                        )}
                      </div>
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
