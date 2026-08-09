import {
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function StudentSchedulePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Schedule
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Keep track of your upcoming classes and activities.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex min-h-72 items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Clock3 className="size-6 text-primary" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Your schedule is empty
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Once classes are assigned to you, your daily
              and upcoming schedule will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
