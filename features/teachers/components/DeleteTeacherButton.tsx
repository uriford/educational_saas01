"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";


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

import { deleteTeacherAction } from "../actions/delete-teacher.action";

type Props = {
  teacherId: string;
};

export default function DeleteTeacherButton({
  teacherId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      const result = await deleteTeacherAction(teacherId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition"
>
  <Trash2 size={18} />
</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Teacher?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will soft delete the teacher. You can restore
            them later if you add a recycle bin feature.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading
              ? "Deleting..."
              : "Delete Teacher"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}