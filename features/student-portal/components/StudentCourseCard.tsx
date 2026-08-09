import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  GraduationCap,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StudentCourseCardProps = {
  enrollment: {
    id: string;
    status: "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED";
    progress: number;
    enrolledAt: Date;
    completedAt: Date | null;
    course: {
      id: string;
      code: string;
      name: string;
      description: string | null;
      duration: number | null;
      fee: unknown;
      startDate: Date | null;
      endDate: Date | null;
      status: string;
    };
  };
};

function formatDate(date: Date | null) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

const statusVariant = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  SUSPENDED: "outline",
  DROPPED: "destructive",
} as const;

export default function StudentCourseCard({
  enrollment,
}: StudentCourseCardProps) {
  const { course } = enrollment;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="size-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {course.code}
              </p>

              <h2 className="mt-1 truncate text-lg font-semibold">
                {course.name}
              </h2>
            </div>
          </div>

          <Badge variant={statusVariant[enrollment.status]}>
            {enrollment.status}
          </Badge>
        </div>

        <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {course.description ||
            "No description has been added for this course."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            <span>
              {course.duration
                ? `${course.duration} days`
                : "No duration"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>{formatDate(course.startDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>{formatDate(course.endDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4" />
            <span>
              {course.fee
                ? `৳${Number(course.fee).toLocaleString()}`
                : "Free"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {enrollment.progress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(
                  Math.max(enrollment.progress, 0),
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Enrolled {formatDate(enrollment.enrolledAt)}
        </p>

        <Link href={`/student/courses/${course.id}`}>
          <Button variant="outline" size="sm">
            View course
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
