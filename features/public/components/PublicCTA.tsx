import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  organizationName: string;
};

export default function PublicCTA({
  organizationName,
}: Props) {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-100">
        <div className="relative px-7 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Ready to make your next move?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Start your learning journey with {organizationName} and take
              the next step toward your goals.
            </p>

            <Link
              href="/courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Explore opportunities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
