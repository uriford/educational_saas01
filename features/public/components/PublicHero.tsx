import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

type Props = {
  organizationName: string;
  coursesCount: number;
  studentsCount: number;
};

export default function PublicHero({
  organizationName,
  coursesCount,
  studentsCount,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-[-180px] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-[-180px] top-20 h-[550px] w-[550px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-300px] left-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Learn with purpose. Grow with confidence.
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Your next chapter in learning starts here.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Discover courses, connect with educators, follow your schedule,
            and build the skills that move you forward with{" "}
            <span className="font-semibold text-white">
              {organizationName}
            </span>
            .
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Student Portal
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7">
            <div>
              <p className="text-2xl font-bold">{coursesCount}+</p>
              <p className="mt-1 text-xs text-slate-400">Active courses</p>
            </div>

            <div>
              <p className="text-2xl font-bold">{studentsCount}+</p>
              <p className="mt-1 text-xs text-slate-400">Learners</p>
            </div>

            <div>
              <p className="text-2xl font-bold">∞</p>
              <p className="mt-1 text-xs text-slate-400">Possibilities</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-400/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Learning dashboard
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    Everything in one place
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <BookOpen className="h-5 w-5 text-cyan-300" />
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {[
                  ["Course progress", "82%"],
                  ["Upcoming class", "Today · 06:00 PM"],
                  ["Assessments", "3 available"],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-white">
                        {value}
                      </span>
                    </div>

                    {index === 0 && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[82%] rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 text-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Start today
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  Turn curiosity into capability.
                </p>
                <Link
                  href="/courses"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
                >
                  View available courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
