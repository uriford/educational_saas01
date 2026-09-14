"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import {
  approveReviewAction,
  deleteReviewAction,
} from "../actions/manage-review.action";

type Review = {
  id: string;
  authorType: "STUDENT" | "GUARDIAN";
  type: "TEXT" | "VIDEO";
  rating: number;
  content: string | null;
  videoUrl: string | null;
  approved: boolean;
  createdAt: Date;
  user: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

type Props = {
  reviews: Review[];
};

export default function AdminReviewList({
  reviews,
}: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(
    null,
  );

  async function handleApprove(id: string) {
    try {
      setLoadingId(id);

      const result = await approveReviewAction(id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve review.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      setLoadingId(id);

      const result = await deleteReviewAction(id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review.");
    } finally {
      setLoadingId(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="font-medium">No reviews yet.</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Submitted reviews will appear here for approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const authorName =
          [review.user.firstName, review.user.lastName]
            .filter(Boolean)
            .join(" ") ||
          review.user.email ||
          "Unknown user";

        return (
          <div
            key={review.id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    {authorName}
                  </h3>

                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {review.authorType === "STUDENT"
                      ? "Verified Student"
                      : "Guardian Testimonial"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      review.approved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {review.approved
                      ? "Approved"
                      : "Pending"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {review.type === "TEXT"
                    ? "Text review"
                    : "Video review"}{" "}
                  · {review.rating}/5
                </div>

                {review.type === "TEXT" &&
                review.content ? (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                    {review.content}
                  </p>
                ) : null}

                {review.type === "VIDEO" &&
                review.videoUrl ? (
                  <a
                    href={review.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm font-semibold underline"
                  >
                    View video
                  </a>
                ) : null}

                <p className="mt-3 text-xs text-muted-foreground">
                  Submitted{" "}
                  {new Date(
                    review.createdAt,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {!review.approved ? (
                  <Button
                    onClick={() =>
                      handleApprove(review.id)
                    }
                    disabled={loadingId === review.id}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                ) : null}

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        disabled={loadingId === review.id}
                      />
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete review?
                      </AlertDialogTitle>

                      <AlertDialogDescription>
                        This review will be permanently removed
                        from the organization.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel
                        disabled={loadingId === review.id}
                      >
                        Cancel
                      </AlertDialogCancel>

                      <AlertDialogAction
                        onClick={() =>
                          handleDelete(review.id)
                        }
                        disabled={loadingId === review.id}
                      >
                        {loadingId === review.id
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
