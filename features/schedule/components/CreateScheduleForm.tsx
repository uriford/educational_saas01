"use client";
import { ORGANIZATION_TIMEZONE } from "@/lib/timezone";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClassSessionAction } from "@/features/class-sessions/actions/create-class-session.action";

type Course = {
  id: string;
  code: string;
  name: string;
};

type Teacher = {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string | null;
  status: string;
};

function localDateTimeToISOString(value: string) {
  if (!value) {
    return "";
  }

  return new Date(`${value}:00+06:00`).toISOString();
}

type Props = {
  courses: Course[];
  teachers: Teacher[];
};

export default function CreateScheduleForm({
  courses,
  teachers,
}: Props) {
  const router = useRouter();

  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!courseId) {
      toast.error("Please select a course.");
      return;
    }

    if (!teacherId) {
      toast.error("Please select a teacher.");
      return;
    }

    if (!title.trim()) {
      toast.error("Class title is required.");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please provide the class start and end time.");
      return;
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

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

      const result = await createClassSessionAction({
        courseId,
        teacherId,
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: localDateTimeToISOString(startTime),
        endTime: localDateTimeToISOString(endTime),
        room: room.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/schedule");
      router.refresh();
    } catch (error) {
      console.error("CREATE SCHEDULE ERROR:", error);

      toast.error("Failed to schedule the class.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <CalendarClock className="size-5 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Schedule a Class
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a class session to your organization&apos;s schedule.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course */}
            <div className="space-y-2">
              <label
                htmlFor="course"
                className="text-sm font-medium"
              >
                Course
              </label>

              <select
                id="course"
                value={courseId}
                onChange={(event) =>
                  setCourseId(event.target.value)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">
                  Select a course
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">
                  Select a teacher
                </option>

                {teachers
                  .filter(
                    (teacher) =>
                      teacher.status === "ACTIVE",
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

            {/* Title */}
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

            {/* Description */}
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

            {/* Date and time */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="startTime"
                  className="text-sm font-medium"
                >
                  Start date & time
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
                  End date & time
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

            {/* Room */}
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

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => router.push("/schedule")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Scheduling..."
                  : "Schedule Class"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
