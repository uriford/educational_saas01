import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  duration: number | null;
  fee: unknown;
  startDate: Date | null;
};

type Props = {
  courses: Course[];
  currency: string;
};

function formatFee(fee: unknown, currency: string) {
  if (fee === null || fee === undefined) return "Contact for fee";

  const value = Number(fee);

  if (!Number.isFinite(value)) return "Contact for fee";

  return `${currency} ${value.toLocaleString()}`;
}

export default function PublicCourses({
  courses,
  currency,
}: Props) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Explore learning
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Courses built for your next step.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Browse our currently available learning opportunities and find
              the one that fits your goals.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-950"
          >
            View all courses
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="font-semibold text-slate-900">
              New courses are coming soon.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Check back shortly for new learning opportunities.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <article
                key={course.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-50 blur-2xl transition group-hover:bg-indigo-100" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {course.code}
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-slate-950">
                    {course.name}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                    {course.description ||
                      "A structured learning experience designed to help you progress with confidence."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {course.duration ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        {course.duration} days
                      </span>
                    ) : null}

                    <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                      {formatFee(course.fee, currency)}
                    </span>
                  </div>

                  <div className="mt-7 border-t border-slate-100 pt-5">
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 transition group-hover:gap-3"
                    >
                      Explore course
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
