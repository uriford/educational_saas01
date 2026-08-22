"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import EnrollmentRequestDialog from "./EnrollmentRequestDialog";


type Props = {
  courseId: string;
};


export default function EnrollCourseButton({
  courseId,
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
        open={open}
        onClose={() => setOpen(false)}
      />

    </>
  );
}
