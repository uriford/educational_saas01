import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { AnnouncementService } from "@/features/announcements/services/announcement.service";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function StudentAnnouncementDetailsPage({
  params,
}: {
  params: Promise<{
    announcementId: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    redirect("/login");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    redirect("/student");
  }

  const { announcementId } = await params;

  const announcement =
    await AnnouncementService.getPublishedByIdForStudent(
      announcementId,
      student.organizationId,
      student.branchId,
    );

  if (!announcement) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/student/announcements"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to announcements
      </Link>

      <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <header className="border-b bg-primary/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Megaphone className="size-3.5" />
              Announcement
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formatDate(
                announcement.publishAt ??
                  announcement.createdAt,
              )}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            {announcement.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            American Council
            {announcement.branch
              ? ` · ${announcement.branch.name}`
              : ""}
          </p>
        </header>

        <div className="p-6 sm:p-8">
          <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90 sm:text-base">
            {announcement.content}
          </div>
        </div>
      </article>
    </div>
  );
}
