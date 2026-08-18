import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

type Props = {
  announcements: Announcement[];
};

export default function PublicAnnouncements({
  announcements,
}: Props) {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Stay informed
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              What&apos;s happening.
            </h2>
          </div>

          <Link
            href="/announcements"
            className="hidden items-center gap-2 text-sm font-bold text-slate-950 sm:inline-flex"
          >
            All announcements
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center lg:col-span-2">
              <Megaphone className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-4 font-semibold text-slate-900">
                No announcements yet.
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.id}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      {announcement.createdAt.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                      {announcement.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {announcement.content}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-950">
                      Read announcement
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
