"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { enrollInCourseAction } from "../../actions/enroll-in-course.action";

type Props = {
  courseId: string;
};

export default function EnrollCourseButton({
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);

    try {
      const result = await enrollInCourseAction(courseId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message ??
          "Enrollment request submitted successfully.",
      );

    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong while submitting request.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-5 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 size-5" />
          Request Enrollment
        </>
      )}
    </Button>
  );
}
