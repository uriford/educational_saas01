import {
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

type StudentWelcomeProps = {
  firstName: string;
  lastName: string | null;
  studentId: string;
  avatar: string | null;
};

export default function StudentWelcome({
  firstName,
  lastName,
  studentId,
  avatar,
}: StudentWelcomeProps) {
  const fullName = `${firstName} ${lastName ?? ""}`.trim();

  return (
    <section className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium">
            <GraduationCap className="size-4" />
            Student Portal
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}! 👋
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
            Stay on top of your courses, schedule, announcements,
            and academic journey from one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-primary-foreground/10 px-4 py-2">
              <p className="text-xs text-primary-foreground/60">
                Student
              </p>
              <p className="mt-0.5 font-semibold">
                {fullName}
              </p>
            </div>

            <div className="rounded-xl bg-primary-foreground/10 px-4 py-2">
              <p className="text-xs text-primary-foreground/60">
                Student ID
              </p>
              <p className="mt-0.5 font-semibold">
                {studentId}
              </p>
            </div>
          </div>

          <Link
            href="/student/profile"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            View my profile
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="hidden shrink-0 md:block">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="size-36 rounded-3xl object-cover ring-4 ring-primary-foreground/10"
            />
          ) : (
            <div className="flex size-36 items-center justify-center rounded-3xl bg-primary-foreground/10 text-5xl font-bold">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
