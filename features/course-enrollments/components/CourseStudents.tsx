import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseEnrollmentService } from "../services/course-enrollment.service";

type Props = {
  courseId: string;
};

export default async function CourseStudents({ courseId }: Props) {
  const enrollments = await CourseEnrollmentService.getCourseStudents(courseId);

  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Enrolled Students</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Students currently enrolled in this course.
            </p>
          </div>

          <Link
            href={`/courses/${courseId}/students/enroll`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Users className="mr-2 h-4 w-4" />
            Enroll Student
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 font-medium">No students enrolled</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Start by enrolling a student in this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Enrolled Students</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {enrollments.length} student
            {enrollments.length === 1 ? "" : "s"} enrolled
          </p>
        </div>

        <Link
          href={`/courses/${courseId}/students/enroll`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Users className="mr-2 h-4 w-4" />
          Enroll Student
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-3 font-medium">Student</th>

              <th className="px-3 py-3 font-medium">Student ID</th>

              <th className="px-3 py-3 font-medium">Status</th>

              <th className="px-3 py-3 font-medium">Progress</th>

              <th className="px-3 py-3 font-medium">Enrolled</th>
            </tr>
          </thead>

          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="border-b last:border-0">
                <td className="px-3 py-4">
                  <div className="font-medium">
                    {enrollment.student.firstName}{" "}
                    {enrollment.student.lastName ?? ""}
                  </div>

                  {enrollment.student.email && (
                    <div className="text-xs text-muted-foreground">
                      {enrollment.student.email}
                    </div>
                  )}
                </td>

                <td className="px-3 py-4">{enrollment.student.studentId}</td>

                <td className="px-3 py-4">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {enrollment.status}
                  </span>
                </td>

                <td className="px-3 py-4">{enrollment.progress}%</td>

                <td className="px-3 py-4 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(enrollment.enrolledAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
