import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "./PublicNavbar";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  MapPin,
  Megaphone,
  Phone,
  Mail,
  Sparkles,
  Users,
  Building2,
  Star,
} from "lucide-react";

type PublicHomeProps = {
  data: {
    organization: {
      id: string;
      code: string;
      name: string;
      slug: string;
      email: string | null;
      phone: string | null;
      domain: string | null;
      logo: string | null;
    };

    stats: {
      students: number;
      teachers: number;
      courses: number;
    };

    branches: Array<{
      id: string;
      name: string;
      slug: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      logo: string | null;
      isHeadquarters: boolean;
    }>;

    courses: Array<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      duration: number | null;
      fee: unknown;
      capacity: number | null;
      startDate: Date | null;
      endDate: Date | null;
    }>;

    announcements: Array<{
      id: string;
      title: string;
      content: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }>;

    upcomingClasses: Array<{
      id: string;
      title: string;
      description: string | null;
      startTime: Date;
      endTime: Date;
      room: string | null;
      course: {
        id: string;
        name: string;
      };
      teacher: {
        teacherId: string;
        firstName: string;
        lastName: string | null;
        designation: string | null;
        avatar: string | null;
      };
    }>;
  };
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(date: Date | null) {
  if (!date) return "Coming soon";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatFee(fee: unknown) {
  if (fee === null || fee === undefined) {
    return "Contact for fee";
  }

  const value = Number(fee);

  if (!Number.isFinite(value)) {
    return "Contact for fee";
  }

  return `৳ ${value.toLocaleString()}`;
}

export default function PublicHome({ data }: PublicHomeProps) {
  const {
    organization,
    stats,
    branches,
    courses,
    announcements,
    upcomingClasses,
  } = data;

  const organizationInitials = initials(organization.name);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-slate-950">
      {/* ================================================================
          NAVIGATION
      ================================================================= */}

      <PublicNavbar
        organizationName={organization.name}
        logo={organization.logo}
        hasBranches={branches.length > 0}
      />

      {/* ================================================================
          HERO
      ================================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute right-[-180px] top-10 h-[600px] w-[600px] rounded-full bg-cyan-100/60 blur-3xl" />
          <div className="absolute bottom-[-300px] left-[35%] h-[500px] w-[500px] rounded-full bg-violet-100/50 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50">
                <Sparkles className="h-3 w-3 text-indigo-600" />
              </span>

              Learn with purpose. Grow with confidence.
            </div>

            <h1 className="mt-7 max-w-4xl text-[3.4rem] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[5.6rem]">
              Build the skills
              <br />
              that shape your
              <span className="relative ml-3 inline-block text-indigo-600">
                future.
                <svg
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 280 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 11C67 4 192 4 276 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Discover programs, stay connected with your classes, and move
              forward with a learning experience built around you at{" "}
              <span className="font-semibold text-slate-900">
                {organization.name}
              </span>
              .
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/student/courses"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admission/american-council"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Apply Now
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Student Portal
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-11 flex flex-wrap gap-x-8 gap-y-5 border-t border-slate-200 pt-7">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.students.toLocaleString()}+
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Learners
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.teachers}+
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Educators
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.courses}+
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Programs
                </p>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/70 via-transparent to-cyan-200/70 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-5 shadow-2xl shadow-slate-950/20 sm:p-7">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                      Learning overview
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                      Everything in one place.
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                    <GraduationCap className="h-5 w-5 text-indigo-300" />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <Users className="h-4 w-4 text-white/40" />

                    <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                      {stats.students.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Learners
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <BookOpen className="h-4 w-4 text-white/40" />

                    <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                      {stats.courses}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Programs
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/40">
                          Active learning community
                        </p>

                        <p className="mt-1 text-xl font-semibold text-white">
                          Growing every day
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Start your journey
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    Turn curiosity into capability.
                  </p>

                  <Link
                    href="/student/courses"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-950"
                  >
                    View available programs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                  <Star className="h-4 w-4 text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Keep learning
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Your next step starts today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TRUST / STATS
      ================================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          {[
            [
              "01",
              "Learners",
              `${stats.students.toLocaleString()}+ students`,
            ],
            [
              "02",
              "Educators",
              `${stats.teachers}+ educators`,
            ],
            [
              "03",
              "Programs",
              `${stats.courses}+ active programs`,
            ],
            [
              "04",
              "Locations",
              branches.length
                ? `${branches.length} learning locations`
                : "Flexible learning",
            ],
          ].map(([number, title, value]) => (
            <div
              key={number}
              className="border-r border-slate-200 px-5 py-7 last:border-r-0 sm:px-7 lg:px-10"
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-300">
                {number}
              </p>

              <p className="mt-3 text-sm font-bold text-slate-900">
                {title}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          PROGRAMS
      ================================================================= */}

      <section
        id="programs"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">
                Explore learning
              </p>

              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
                Programs designed for your next move.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Discover the programs currently available through{" "}
                {organization.name}.
              </p>
            </div>

            <Link
              href="/student/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              View all courses
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course, index) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-950/10"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-50 blur-3xl transition group-hover:bg-indigo-100" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        {course.code}
                      </span>

                      <span className="text-4xl font-semibold tracking-[-0.06em] text-slate-100">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-8 text-xl font-semibold tracking-tight text-slate-950">
                      {course.name}
                    </h3>

                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
                      {course.description
                        ? plainText(course.description).slice(0, 150)
                        : "Explore this program and discover where it can take you."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {course.duration ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                          <Clock3 className="h-3.5 w-3.5" />
                          {course.duration} days
                        </span>
                      ) : null}

                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {formatFee(course.fee)}
                      </span>
                    </div>

                    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Starts
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {formatDate(course.startDate)}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition group-hover:bg-slate-950 group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-14 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-4 font-semibold text-slate-900">
                New programs are coming soon.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Check back shortly for the latest learning opportunities.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          WHY US
      ================================================================= */}

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              The learning experience
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              More than classes.
              <br />
              A place to grow.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
              {organization.name} brings programs, schedules, educators,
              announcements, and learner resources together in one connected
              experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                BookOpen,
                "Structured learning",
                "Programs and learning opportunities organized around clear goals.",
              ],
              [
                GraduationCap,
                "Expert guidance",
                "Learn with educators and mentors who support your progress.",
              ],
              [
                CalendarDays,
                "Clear schedules",
                "Know what is happening next and plan your learning with confidence.",
              ],
              [
                Users,
                "Connected community",
                "Stay connected with the people and opportunities around your learning.",
              ],
            ].map(([Icon, title, description]) => (
              <div
                key={title as string}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 transition hover:bg-white/[0.07]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-indigo-300" />
                </div>

                <h3 className="mt-5 text-base font-semibold">
                  {title as string}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SCHEDULE
      ================================================================= */}

      <section
        id="schedule"
        className="scroll-mt-24 bg-[#eef1f5] px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">
                What&apos;s next
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Classes in motion.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                See upcoming learning sessions and stay ahead of your schedule.
              </p>

              <Link
                href="/schedule"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View full schedule
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="group grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-lg sm:grid-cols-[75px_1fr_auto] sm:items-center"
                  >
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {session.startTime.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>

                      <span className="text-lg font-bold">
                        {session.startTime.getDate()}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-indigo-600">
                        {session.course.name}
                      </p>

                      <h3 className="mt-1 font-semibold tracking-tight text-slate-950">
                        {session.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>
                          {formatTime(session.startTime)}
                          {" – "}
                          {formatTime(session.endTime)}
                        </span>

                        {session.room ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {session.room}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      {session.teacher.avatar ? (
                        <Image
                          src={session.teacher.avatar}
                          alt={`${session.teacher.firstName} ${
                            session.teacher.lastName ?? ""
                          }`}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                          {initials(
                            `${session.teacher.firstName} ${
                              session.teacher.lastName ?? ""
                            }`,
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {session.teacher.firstName}{" "}
                          {session.teacher.lastName ?? ""}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {session.teacher.designation || "Instructor"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-4 font-semibold text-slate-900">
                    No upcoming classes published yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Check back soon for the latest schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          ANNOUNCEMENTS
      ================================================================= */}

      <section
        id="updates"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">
                Latest updates
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                What&apos;s happening.
              </h2>
            </div>

            <Link
              href="/announcements"
              className="hidden items-center gap-2 text-sm font-bold text-slate-900 sm:inline-flex"
            >
              All announcements
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {announcements.length > 0 ? (
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              {announcements.slice(0, 4).map((announcement, index) => (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className={`group rounded-[1.5rem] border p-6 transition hover:-translate-y-0.5 hover:shadow-xl ${
                    index === 0
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                        index === 0
                          ? "text-white/40"
                          : "text-slate-400"
                      }`}
                    >
                      Announcement
                    </span>

                    <span
                      className={`text-xs ${
                        index === 0
                          ? "text-white/40"
                          : "text-slate-400"
                      }`}
                    >
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>

                  <div className="mt-7 flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        index === 0
                          ? "bg-white/10"
                          : "bg-slate-100"
                      }`}
                    >
                      <Megaphone
                        className={`h-4 w-4 ${
                          index === 0
                            ? "text-indigo-300"
                            : "text-slate-500"
                        }`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        {announcement.title}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${
                          index === 0
                            ? "text-white/50"
                            : "text-slate-500"
                        }`}
                      >
                        {plainText(announcement.content).slice(0, 190)}
                      </p>

                      <span
                        className={`mt-5 inline-flex items-center gap-1 text-sm font-bold ${
                          index === 0
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        Read announcement
                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-12 text-center">
              <Megaphone className="mx-auto h-7 w-7 text-slate-300" />

              <p className="mt-4 font-semibold text-slate-900">
                No announcements yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Important updates will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          LOCATIONS
      ================================================================= */}

      {branches.length > 0 ? (
        <section
          id="locations"
          className="scroll-mt-24 bg-slate-950 px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                Find us
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Learning, wherever you are.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                Explore our active locations and find the learning environment
                that works best for you.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <Building2 className="h-5 w-5" />
                    </div>

                    {branch.isHeadquarters ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-300">
                        Headquarters
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {branch.name}
                  </h3>

                  {branch.address ? (
                    <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-400">
                      <MapPin className="mt-1 h-4 w-4 shrink-0" />
                      {branch.address}
                    </p>
                  ) : null}

                  {branch.phone ? (
                    <a
                      href={`tel:${branch.phone}`}
                      className="mt-3 flex gap-2 text-sm text-slate-400 transition hover:text-white"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {branch.phone}
                    </a>
                  ) : null}

                  {branch.email ? (
                    <a
                      href={`mailto:${branch.email}`}
                      className="mt-3 flex gap-2 break-all text-sm text-slate-400 transition hover:text-white"
                    >
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                      {branch.email}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================
          CTA
      ================================================================= */}

      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 px-7 py-14 text-white shadow-2xl shadow-indigo-950/20 sm:px-12 sm:py-18 lg:px-16">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                Your journey starts here
              </p>

              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Ready to take the next step?
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                Explore the available programs and find the right learning
                opportunity for you.
              </p>
            </div>

            <Link
              href="/student/courses"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================= */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                {organization.logo ? (
                  <Image
                    src={organization.logo}
                    alt={organization.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                    {organizationInitials}
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {organization.name}
                  </p>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Learning platform
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                A modern learning environment designed to help learners learn,
                grow, and achieve more.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                Explore
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <Link
                  href="/student/courses"
                  className="block transition hover:text-slate-950"
                >
                  Courses
                </Link>

                <Link
                  href="/schedule"
                  className="block transition hover:text-slate-950"
                >
                  Schedule
                </Link>

                <Link
                  href="/announcements"
                  className="block transition hover:text-slate-950"
                >
                  Announcements
                </Link>

                <Link
                  href="/login"
                  className="block transition hover:text-slate-950"
                >
                  Student Portal
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                Contact
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                {organization.email ? (
                  <a
                    href={`mailto:${organization.email}`}
                    className="flex gap-2 break-all transition hover:text-slate-950"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                    {organization.email}
                  </a>
                ) : null}

                {organization.phone ? (
                  <a
                    href={`tel:${organization.phone}`}
                    className="flex gap-2 transition hover:text-slate-950"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {organization.phone}
                  </a>
                ) : null}

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 font-semibold text-slate-950"
                >
                  Contact us
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {organization.name}. All rights
              reserved.
            </p>

            <p>
              Powered by the learning platform.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
