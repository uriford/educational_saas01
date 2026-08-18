"use client";

import { useState } from "react";

import {
  Check,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  addChatStaffAction,
  removeChatStaffAction,
  updateChatStaffAction,
} from "../actions/chat-staff-management.actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface StaffUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  status: string;
}

interface ChatStaffMember {
  id: string;
  organizationId: string;
  userId: string;
  position?: string | null;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  lastSeenAt?: Date | string | null;
  lastActiveAt?: Date | string | null;
  canReply: boolean;
  canViewAllChats: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user: StaffUser;
}

interface Props {
  initialStaff: ChatStaffMember[];
  initialUsers: StaffUser[];
}

function getName(user: StaffUser) {
  return [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(user: StaffUser) {
  return `${user.firstName?.[0] ?? ""}${
    user.lastName?.[0] ?? ""
  }`.toUpperCase();
}

function statusLabel(
  status: ChatStaffMember["status"],
) {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "BUSY":
      return "Busy";
    default:
      return "Offline";
  }
}

function statusClass(
  status: ChatStaffMember["status"],
) {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "BUSY":
      return "bg-yellow-500";
    default:
      return "bg-muted-foreground/50";
  }
}

export default function ChatStaffManagement({
  initialStaff,
  initialUsers,
}: Props) {
  const [staff, setStaff] =
    useState<ChatStaffMember[]>(initialStaff);

  const [users, setUsers] =
    useState<StaffUser[]>(initialUsers);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [position, setPosition] =
    useState("");

  const [canReply, setCanReply] =
    useState(true);

  const [canViewAllChats, setCanViewAllChats] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  function resetForm() {
    setSelectedUserId("");
    setPosition("");
    setCanReply(true);
    setCanViewAllChats(false);
    setShowAddForm(false);
  }

  async function handleAddStaff() {
    if (!selectedUserId) {
      setMessage({
        type: "error",
        text: "Please select a user.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result =
        await addChatStaffAction({
          userId: selectedUserId,
          position:
            position.trim() || null,
          canReply,
          canViewAllChats,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text:
            result.message ??
            "Failed to add chat staff.",
        });
        return;
      }

      if ("data" in result && result.data) {
        setStaff((current) => [
          ...current,
          result.data as ChatStaffMember,
        ]);

        setUsers((current) =>
          current.filter(
            (user) =>
              user.id !== selectedUserId,
          ),
        );
      }

      setMessage({
        type: "success",
        text:
          result.message ??
          "Chat staff added successfully.",
      });

      resetForm();
    } catch {
      setMessage({
        type: "error",
        text:
          "Something went wrong while adding staff.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveStaff(
    staffId: string,
  ) {
    if (
      !window.confirm(
        "Remove this user from chat staff?",
      )
    ) {
      return;
    }

    setRemovingId(staffId);
    setMessage(null);

    try {
      const result =
        await removeChatStaffAction(
          staffId,
        );

      if (!result.success) {
        setMessage({
          type: "error",
          text:
            result.message ??
            "Failed to remove staff.",
        });
        return;
      }

      const removed = staff.find(
        (member) => member.id === staffId,
      );

      setStaff((current) =>
        current.filter(
          (member) => member.id !== staffId,
        ),
      );

      if (removed) {
        setUsers((current) => [
          ...current,
          removed.user,
        ]);
      }

      setMessage({
        type: "success",
        text:
          result.message ??
          "Staff removed successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text:
          "Something went wrong while removing staff.",
      });
    } finally {
      setRemovingId(null);
    }
  }

  async function handleToggle(
    member: ChatStaffMember,
    field:
      | "canReply"
      | "canViewAllChats",
  ) {
    setSavingId(member.id);
    setMessage(null);

    const value = !member[field];

    try {
      const result =
        await updateChatStaffAction({
          staffId: member.id,
          [field]: value,
        });

      if (!result.success) {
        setMessage({
          type: "error",
          text:
            result.message ??
            "Failed to update staff.",
        });
        return;
      }

      setStaff((current) =>
        current.map((item) =>
          item.id === member.id
            ? {
                ...item,
                [field]: value,
              }
            : item,
        ),
      );

      setMessage({
        type: "success",
        text: "Staff permissions updated.",
      });
    } catch {
      setMessage({
        type: "error",
        text:
          "Something went wrong while updating staff.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Chat Staff
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage the organization members who can
            handle student conversations.
          </p>
        </div>

        <Button
          onClick={() =>
            setShowAddForm((value) => !value)
          }
        >
          {showAddForm ? (
            <X className="mr-2 h-4 w-4" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}

          {showAddForm
            ? "Cancel"
            : "Add Chat Staff"}
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Add Chat Staff
                </h2>

                <p className="text-sm text-muted-foreground">
                  Select an existing organization user.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="staff-user">
                Organization User
              </Label>

              {users.length > 0 ? (
                <select
                  id="staff-user"
                  value={selectedUserId}
                  onChange={(event) =>
                    setSelectedUserId(
                      event.target.value,
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">
                    Select a user...
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {getName(user)} —{" "}
                      {user.email} (
                      {user.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  There are no eligible organization
                  users available to add.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-position">
                Position
              </Label>

              <Input
                id="staff-position"
                placeholder="e.g. Support Officer"
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value)
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setCanReply((value) => !value)
                }
                className={`rounded-lg border p-4 text-left transition-colors ${
                  canReply
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Can Reply
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Allow this staff member to send
                      messages to students.
                    </p>
                  </div>

                  {canReply && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCanViewAllChats(
                    (value) => !value,
                  )
                }
                className={`rounded-lg border p-4 text-left transition-colors ${
                  canViewAllChats
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      View All Chats
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Allow access to every organization
                      conversation.
                    </p>
                  </div>

                  {canViewAllChats && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAddStaff}
                disabled={
                  loading ||
                  !selectedUserId ||
                  users.length === 0
                }
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Add Staff
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Chat Staff Members
              </h2>

              <p className="text-sm text-muted-foreground">
                {staff.length} staff member
                {staff.length === 1 ? "" : "s"}{" "}
                currently configured.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-medium">
                No chat staff yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Add an existing organization user to
                start assigning student conversations.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            member.user.avatar ??
                            undefined
                          }
                        />

                        <AvatarFallback>
                          {getInitials(member.user)}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusClass(
                          member.status,
                        )}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {getName(member.user)}
                      </p>

                      <p className="truncate text-sm text-muted-foreground">
                        {member.user.email}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {member.position ??
                            "Chat Staff"}
                        </span>

                        <span>•</span>

                        <span>
                          {statusLabel(
                            member.status,
                          )}
                        </span>

                        <span>•</span>

                        <span>
                          {member.user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={
                        member.canReply
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      disabled={
                        savingId === member.id
                      }
                      onClick={() =>
                        handleToggle(
                          member,
                          "canReply",
                        )
                      }
                    >
                      {savingId === member.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      Reply
                    </Button>

                    <Button
                      type="button"
                      variant={
                        member.canViewAllChats
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      disabled={
                        savingId === member.id
                      }
                      onClick={() =>
                        handleToggle(
                          member,
                          "canViewAllChats",
                        )
                      }
                    >
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      All Chats
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={
                        removingId === member.id
                      }
                      onClick={() =>
                        handleRemoveStaff(
                          member.id,
                        )
                      }
                    >
                      {removingId === member.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
