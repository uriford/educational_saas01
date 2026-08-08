"use client";

import { CalendarDays, Clock3, Pencil, Trash2, Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Course } from "@prisma/client";

type Props = {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
};

export default function CourseCard({
  course,
  onEdit,
  onDelete,
}: Props) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not scheduled";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {course.code}
            </p>

            <h3 className="mt-1 truncate text-lg font-semibold">
              {course.name}
            </h3>
          </div>

          <Badge
            variant={
              course.status === "ACTIVE"
                ? "default"
                : course.status === "INACTIVE"
                  ? "secondary"
                  : "outline"
            }
          >
            {course.status}
          </Badge>
        </div>

        {course.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>
              {course.duration
                ? `${course.duration} days`
                : "No duration"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {course.capacity
                ? `${course.capacity} students`
                : "Unlimited"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(course.startDate)}</span>
          </div>

          <div className="text-sm font-medium">
            {course.fee
              ? `৳${Number(course.fee).toLocaleString()}`
              : "Free"}
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(course)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(course)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}