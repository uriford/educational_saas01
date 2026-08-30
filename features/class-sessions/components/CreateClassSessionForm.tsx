"use client";
import { ORGANIZATION_TIMEZONE } from "@/lib/timezone";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { createClassSessionAction } from "../actions/create-class-session.action";

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
  courseId: string;
  courseName: string;
  teachers: Teacher[];
};

export default function CreateClassSessionForm({
  courseId,
  courseName,
  teachers,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teacherId) {
      toast.error("Please select a teacher.");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please provide the class start and end time.");
      return;
    }

    try {
      setLoading(true);

      const result = await createClassSessionAction({
        courseId,
        teacherId,
        title,
        description,
        startTime: localDateTimeToISOString(startTime),
        endTime: localDateTimeToISOString(endTime),
        room,
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
      toast.error("Failed to create class session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <CalendarClock className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create Class Session
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Schedule a class for{" "}
              <span className="font-medium text-foreground">{courseName}</span>.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Class title
              </label>

              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. IELTS Reading Practice"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="teacher" className="text-sm font-medium">
                Teacher
              </label>

              <select
                id="teacher"
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a teacher</option>

                {teachers
                  .filter((teacher) => teacher.status === "ACTIVE")
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName ?? ""} —{" "}
                      {teacher.teacherId}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional class description..."
                rows={4}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium">
                  Start time
                </label>

                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium">
                  End time
                </label>

                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium">
                Room
              </label>

              <Input
                id="room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="e.g. Room 204"
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Class Session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
