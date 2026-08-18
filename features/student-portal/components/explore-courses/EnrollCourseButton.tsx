"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { enrollInCourseAction } from "../../actions/enroll-in-course.action";

type Props = {
  courseId: string;
};

export default function EnrollCourseButton({
  courseId,
}: Props) {
  const router = useRouter();
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
        result.message ?? "You have been enrolled successfully.",
      );

      router.push(`/student/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while enrolling.");
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
          Enrolling...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 size-5" />
          Enroll Now
        </>
      )}
    </Button>
  );
}
