import { ORGANIZATION_TIMEZONE } from "@/lib/timezone";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

type ClassSession = {
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
};

function getLocalDateParts(date: Date) {
  const timeZone = ORGANIZATION_TIMEZONE;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).formatToParts(date);

  return parts.reduce(
    (acc, part) => {
      acc[part.type] = part.value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

type Props = {
  sessions: ClassSession[];
};

export default function PublicSchedule({
  sessions,
}: Props) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Keep moving
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Upcoming learning sessions.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              See what&apos;s coming up and plan your learning around the
              sessions that matter.
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
            {sessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-3 font-semibold text-slate-900">
                  No upcoming sessions.
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="group flex flex-col gap-5 rounded-3xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {getLocalDateParts(session.startTime).month}
                    </span>
                    <span className="text-xl font-bold">
                      {getLocalDateParts(session.startTime).day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-indigo-600">
                      {session.course.name}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-slate-950">
                      {session.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        {session.startTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" – "}
                        {session.endTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>

                      {session.room ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {session.room}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-700 sm:text-right">
                    <p>
                      {session.teacher.firstName}{" "}
                      {session.teacher.lastName ?? ""}
                    </p>
                    <p className="mt-1 text-xs font-normal text-slate-400">
                      {session.teacher.designation || "Instructor"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
