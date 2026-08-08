"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteCourseAction } from "../actions/delete-course.action";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  courseId: string;
};

export default function DeleteCourseButton({ courseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      const result = await deleteCourseAction(courseId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/courses");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete course.");
    } finally {
      setLoading(false);
    }
  }

return (
  <AlertDialog>
    <AlertDialogTrigger
      render={
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Course
        </Button>
      }
    />

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

        <AlertDialogDescription>
          This course will be removed from the course list.
          The course data will be retained in the system for
          record-keeping. This action cannot be undone from the
          interface.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>
          Cancel
        </AlertDialogCancel>

        <AlertDialogAction
          onClick={handleDelete}
          disabled={loading}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {loading ? "Deleting..." : "Delete Course"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
}