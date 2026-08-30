"use client";
import {
  ORGANIZATION_TIMEZONE,
  organizationLocalDateTimeToISOString,
} from "@/lib/timezone";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { updateClassSessionAction } from "../actions/update-class-session.action";

type Teacher = {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string | null;
  status: string;
};

type Props = {
  session: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    room: string | null;
    status:
      | "SCHEDULED"
      | "ONGOING"
      | "COMPLETED"
      | "CANCELLED";
    teacherId: string;
  };
  courseId: string;
  courseName: string;
  teachers: Teacher[];
};

function formatDateTimeLocal(date: Date) {
  const value = new Date(date);

  const timeZone = ORGANIZATION_TIMEZONE;

  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  const parts = formatter
    .formatToParts(value)
    .reduce(
      (acc, part) => {
        acc[part.type] = part.value;
        return acc;
      },
      {} as Record<string, string>,
    );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default function EditClassSessionForm({
  session,
  courseId,
  courseName,
  teachers,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(session.title);
  const [teacherId, setTeacherId] = useState(session.teacherId);
  const [description, setDescription] = useState(
    session.description ?? "",
  );
  const [startTime, setStartTime] = useState(
    formatDateTimeLocal(session.startTime),
  );
  const [endTime, setEndTime] = useState(
    formatDateTimeLocal(session.endTime),
  );
  const [room, setRoom] = useState(session.room ?? "");
  const [status, setStatus] = useState(session.status);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!teacherId) {
      toast.error("Please select a teacher.");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please provide the class start and end time.");
      return;
    }

    const parsedStartTime = new Date(
      organizationLocalDateTimeToISOString(startTime),
    );
    const parsedEndTime = new Date(
      organizationLocalDateTimeToISOString(endTime),
    );

    if (
      Number.isNaN(parsedStartTime.getTime()) ||
      Number.isNaN(parsedEndTime.getTime())
    ) {
      toast.error("Invalid date or time.");
      return;
    }

    if (parsedStartTime >= parsedEndTime) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      setLoading(true);

      const result = await updateClassSessionAction({
        id: session.id,
        title,
        teacherId,
        description,
        startTime: organizationLocalDateTimeToISOString(startTime),
        endTime: organizationLocalDateTimeToISOString(endTime),
        room,
        status,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update class session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <CalendarClock className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Class Session
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Update the class session for{" "}
            <span className="font-medium text-foreground">
              {courseName}
            </span>
            .
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Class title
              </label>

              <Input
                id="title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. IELTS Reading Practice"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="teacher"
                className="text-sm font-medium"
              >
                Teacher
              </label>

              <select
                id="teacher"
                value={teacherId}
                onChange={(event) =>
                  setTeacherId(event.target.value)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">
                  Select a teacher
                </option>

                {teachers
                  .filter(
                    (teacher) =>
                      teacher.status === "ACTIVE" ||
                      teacher.id === session.teacherId,
                  )
                  .map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.firstName}{" "}
                      {teacher.lastName ?? ""} —{" "}
                      {teacher.teacherId}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional class description..."
                rows={4}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="startTime"
                  className="text-sm font-medium"
                >
                  Start time
                </label>

                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="endTime"
                  className="text-sm font-medium"
                >
                  End time
                </label>

                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="room"
                className="text-sm font-medium"
              >
                Room
              </label>

              <Input
                id="room"
                value={room}
                onChange={(event) =>
                  setRoom(event.target.value)
                }
                placeholder="e.g. Room 204"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as typeof status,
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="ONGOING">
                  Ongoing
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  router.push(`/courses/${courseId}`)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update Class Session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
