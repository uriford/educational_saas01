"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import EnrollmentRequestDialog from "./EnrollmentRequestDialog";


type Props = {
  courseId: string;
  courseFee: unknown;
};


export default function EnrollCourseButton({
  courseId,
  courseFee,
}: Props) {

  const [open, setOpen] = useState(false);


  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen(true)}
      >
        <Send className="mr-2 size-5" />
        Request Enrollment
      </Button>


      <EnrollmentRequestDialog
        courseId={courseId}
        courseFee={courseFee}
        open={open}
        onClose={() => setOpen(false)}
      />

    </>
  );
}
