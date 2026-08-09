import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type StudentOverviewProps = {
  student: {
    studentId: string;
    admissionDate: Date;
    status: string;
  };
};

const cards = [
  {
    title: "My Courses",
    value: "0",
    description: "Currently enrolled",
    icon: BookOpen,
  },
  {
    title: "Attendance",
    value: "—",
    description: "Attendance overview",
    icon: CheckCircle2,
  },
  {
    title: "Upcoming Classes",
    value: "0",
    description: "Classes scheduled",
    icon: CalendarDays,
  },
  {
    title: "Learning Hours",
    value: "—",
    description: "This month",
    icon: Clock3,
  },
];

export default function StudentOverview({
  student,
}: StudentOverviewProps) {
  const admissionDate = new Date(
    student.admissionDate,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Your Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A quick look at your academic activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">
            Academic Status
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm text-muted-foreground">
                Student ID
              </span>
              <span className="font-medium">
                {student.studentId}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm text-muted-foreground">
                Status
              </span>

              <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                {student.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Admission Date
              </span>
              <span className="font-medium">
                {admissionDate}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">
            Upcoming Classes
          </h3>

          <div className="mt-6 flex min-h-36 items-center justify-center rounded-xl border border-dashed">
            <div className="text-center">
              <CalendarDays className="mx-auto size-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No upcoming classes
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Your scheduled classes will appear here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
