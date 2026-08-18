"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createLessonAction } from "../actions/create-lesson.action";
import { updateLessonAction } from "../actions/update-lesson.action";
import type { LessonType } from "../types";

type Props = {
  mode: "create" | "edit";
  courseId: string;
  lessonId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    content?: string;
    type?: LessonType;
    videoUrl?: string;
    documentUrl?: string;
    externalUrl?: string;
    duration?: number;
  };
};

export default function LessonForm({
  mode,
  courseId,
  lessonId,
  defaultValues,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(
    defaultValues?.title ?? "",
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [content, setContent] = useState(
    defaultValues?.content ?? "",
  );
  const [type, setType] = useState<LessonType>(
    defaultValues?.type ?? "TEXT",
  );
  const [videoUrl, setVideoUrl] = useState(
    defaultValues?.videoUrl ?? "",
  );
  const [documentUrl, setDocumentUrl] = useState(
    defaultValues?.documentUrl ?? "",
  );
  const [externalUrl, setExternalUrl] = useState(
    defaultValues?.externalUrl ?? "",
  );
  const [duration, setDuration] = useState(
    defaultValues?.duration?.toString() ?? "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content,
        type,
        videoUrl: videoUrl.trim(),
        documentUrl: documentUrl.trim(),
        externalUrl: externalUrl.trim(),
        duration: duration
          ? Number(duration)
          : undefined,
      };

      const result =
        mode === "create"
          ? await createLessonAction({
              courseId,
              ...payload,
            })
          : await updateLessonAction(
              lessonId!,
              courseId,
              payload,
            );

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      router.push(
        `/courses/${courseId}/lessons`,
      );
      router.refresh();
    } catch (error) {
      console.error(
        "LESSON FORM ERROR:",
        error,
      );

      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button
          type="button"
          variant="ghost"
          className="mb-3 -ml-2"
          onClick={() =>
            router.push(
              `/courses/${courseId}/lessons`,
            )
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "create"
            ? "Create Lesson"
            : "Edit Lesson"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "create"
            ? "Add learning content to this course."
            : "Update this lesson's learning content."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">
            Lesson Title
          </Label>

          <Input
            id="title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Introduction to Grammar"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>

          <Textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Briefly describe this lesson..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">
            Lesson Type
          </Label>

          <select
            id="type"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as LessonType,
              )
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TEXT">
              Text Lesson
            </option>
            <option value="VIDEO">
              Video Lesson
            </option>
            <option value="DOCUMENT">
              Document
            </option>
            <option value="LINK">
              External Link
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Lesson Content
          </Label>

          <Textarea
            id="content"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Write the lesson content here..."
            rows={10}
          />

          <p className="text-xs text-muted-foreground">
            Add the main educational content for this
            lesson.
          </p>
        </div>

        {type === "VIDEO" && (
          <div className="space-y-2">
            <Label htmlFor="videoUrl">
              Video URL
            </Label>

            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) =>
                setVideoUrl(event.target.value)
              }
              placeholder="https://..."
            />
          </div>
        )}

        {type === "DOCUMENT" && (
          <div className="space-y-2">
            <Label htmlFor="documentUrl">
              Document URL
            </Label>

            <Input
              id="documentUrl"
              type="url"
              value={documentUrl}
              onChange={(event) =>
                setDocumentUrl(event.target.value)
              }
              placeholder="https://..."
            />
          </div>
        )}

        {type === "LINK" && (
          <div className="space-y-2">
            <Label htmlFor="externalUrl">
              External URL
            </Label>

            <Input
              id="externalUrl"
              type="url"
              value={externalUrl}
              onChange={(event) =>
                setExternalUrl(event.target.value)
              }
              placeholder="https://..."
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration (minutes)
          </Label>

          <Input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(event) =>
              setDuration(event.target.value)
            }
            placeholder="60"
          />

          <p className="text-xs text-muted-foreground">
            Optional estimated lesson duration.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `/courses/${courseId}/lessons`,
              )
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />

            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Lesson"
                : "Update Lesson"}
          </Button>
        </div>
      </form>
    </div>
  );
}
