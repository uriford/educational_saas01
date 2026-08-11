import {
  ArrowRight,
  Bell,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { AnnouncementService } from "@/features/announcements/services/announcement.service";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function truncateContent(content: string, maxLength = 180) {
  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

export default async function StudentAnnouncementsPage() {
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
    return (
      <section className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex min-h-64 items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Bell className="size-6 text-primary" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Student profile not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your account is authenticated, but no student
              profile is connected to it yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const announcements =
    await AnnouncementService.getPublishedForStudent(
      student.organizationId,
      student.branchId,
    );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />

              <h1 className="text-2xl font-bold tracking-tight">
                Announcements
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Important updates and announcements from American Council.
            </p>
          </div>

          <span className="w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {announcements.length}{" "}
            {announcements.length === 1
              ? "announcement"
              : "announcements"}
          </span>
        </div>
      </section>

      {announcements.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex min-h-72 items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bell className="size-6 text-primary" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No announcements
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                There are no active announcements for you right now.
                New updates from your organization will appear here.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Megaphone className="size-5 text-primary" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(
                    announcement.publishAt ??
                      announcement.createdAt,
                  )}
                </div>
              </div>

              <h2 className="mt-5 text-lg font-semibold tracking-tight">
                {announcement.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {truncateContent(announcement.content)}
              </p>

              <Link
                href={`/student/announcements/${announcement.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Read announcement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
