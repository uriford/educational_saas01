import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import SaaSNavbar from "./SaaSNavbar";
import SaaSFooter from "./SaaSFooter";

const capabilities = [
  {
    icon: Users,
    title: "Student management",
    description:
      "Keep student records, enrollment, progress, and academic activity organized in one system.",
  },
  {
    icon: Workflow,
    title: "Academic operations",
    description:
      "Coordinate courses, schedules, classes, branches, and day-to-day institutional workflows.",
  },
  {
    icon: Bot,
    title: "AI-powered assessments",
    description:
      "Turn learning material into assessment workflows and support more intelligent academic decisions.",
  },
  {
    icon: CreditCard,
    title: "Payments & enrollment",
    description:
      "Manage enrollment and payment information without scattering critical data across disconnected tools.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Give administrators a clearer view of students, programs, activity, and institutional performance.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description:
      "Keep administrators, branches, students, and guardians inside the experiences built for them.",
  },
];

export default function SaaSHome() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <SaaSNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-15%] top-[-25%] h-[620px] w-[620px] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute right-[-15%] top-[10%] h-[580px] w-[580px] rounded-full bg-cyan-100/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Software for modern learning institutions
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-[5.8rem]">
              Run your institution
              <br />
              <span className="text-indigo-600">without the chaos.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              Uriford brings student management, academic operations,
              assessments, communication, payments, analytics, and more into
              one connected platform.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Explore the platform
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* PRODUCT MOCKUP */}
          <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-200/50 via-transparent to-cyan-200/50 blur-3xl" />

            <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/20 sm:rounded-[2rem]">
              <div className="flex h-12 items-center border-b border-white/10 px-4 sm:px-6">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>

                <div className="mx-auto hidden rounded-lg border border-white/10 bg-white/5 px-20 py-1.5 text-[10px] text-white/30 sm:block">
                  app.uriford.com/dashboard
                </div>
              </div>

              <div className="grid min-h-[430px] lg:grid-cols-[190px_1fr]">
                <aside className="hidden border-r border-white/10 p-5 lg:block">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-950">
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    Institution
                  </div>

                  <div className="mt-8 space-y-2">
                    {[
                      ["Dashboard", true],
                      ["Students", false],
                      ["Courses", false],
                      ["Schedule", false],
                      ["Assessments", false],
                      ["Analytics", false],
                    ].map(([label, active]) => (
                      <div
                        key={label as string}
                        className={`rounded-lg px-3 py-2 text-xs ${
                          active
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/40"
                        }`}
                      >
                        {label as string}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                        Overview
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        Good morning, administrator.
                      </h2>
                    </div>

                    <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:flex">
                      <div className="h-4 w-4 rounded-full bg-white/30" />
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["1,245", "Students"],
                      ["42", "Educators"],
                      ["15", "Courses"],
                      ["৳4.5L", "Revenue"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/10 bg-white/[0.045] p-4"
                      >
                        <p className="text-2xl font-semibold tracking-tight text-white">
                          {value}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Student activity
                          </p>
                          <p className="mt-1 text-[10px] text-white/30">
                            Learning activity over time
                          </p>
                        </div>
                        <BarChart3 className="h-4 w-4 text-white/30" />
                      </div>

                      <div className="mt-7 flex h-28 items-end gap-2">
                        {[34, 51, 44, 68, 57, 79, 71, 88, 76, 94, 83, 98].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t bg-indigo-400/50"
                              style={{ height: `${height}%` }}
                            />
                          ),
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5">
                      <p className="text-xs font-semibold text-white">
                        Recent activity
                      </p>

                      <div className="mt-5 space-y-4">
                        {[
                          "New student enrolled",
                          "Assessment completed",
                          "Payment recorded",
                          "Course updated",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-3">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/70" />
                            <span className="text-[11px] text-white/45">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-3">
                    <Bot className="h-4 w-4 text-indigo-300" />
                    <p className="text-[11px] text-white/55">
                      AI-powered workflows can help your team identify what
                      needs attention next.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              One connected platform
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Your institution has enough moving parts.
            </h2>
          </div>

          <div className="max-w-2xl lg:ml-auto">
            <p className="text-lg leading-8 text-slate-500">
              Stop making your team jump between disconnected tools. Uriford
              brings the operational pieces together so administrators can
              spend less time managing systems and more time improving the
              institution.
            </p>

            <Link
              href="/features"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-slate-950"
            >
              See everything the platform can do
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Built for the whole institution
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Everything your team needs to keep learning moving.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white p-7 transition hover:bg-slate-50 sm:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-6 text-base font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MULTI TENANT */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Built to scale
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              One platform. Multiple institutions. Their own experience.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">
              Uriford is designed around organizations rather than a
              one-size-fits-all application. Institutions can operate
              independently while branches, teams, students, and guardians
              stay within the right experience.
            </p>

            <Link
              href="/solutions"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Explore solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-[#f7f8fa] p-5 shadow-sm sm:p-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold">Organization</p>
                      <p className="text-xs text-slate-400">
                        Central administration
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    "Head Office",
                    "Branch A",
                    "Branch B",
                    "Online Programs",
                  ].map((branch) => (
                    <div
                      key={branch}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-600"
                    >
                      {branch}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-950">
                    Role-aware
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    The right experience for every user.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
            Start building a better operation
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Give your institution a platform it can grow with.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Explore the platform, understand how it works, and start a
            conversation about bringing it to your institution.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Get started
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Read the docs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SaaSFooter />
    </main>
  );
}
