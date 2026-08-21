import {
  ArrowRight,
  BookOpen,
  CreditCard,
  ClipboardCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";

type UpcomingClass = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  room: string | null;
  course: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    firstName: string;
    lastName: string | null;
  };
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

type StudentOverviewProps = {
  student: {
    studentId: string;
    admissionDate: Date;
    status: string;
  };
  courseCount: number;
  upcomingClassCount: number;
  upcomingClasses: UpcomingClass[];
  pendingPayments: number;
  enrollmentRequests: {
    id: string;
    status: string;
    course: {
      name: string;
      code: string;
    };
    createdAt: Date;
  }[];
};

export default function StudentOverview({
  student,
  courseCount,
  upcomingClassCount,
  upcomingClasses,
  pendingPayments,
  enrollmentRequests,
}: StudentOverviewProps) {
  const admissionDate = new Date(
    student.admissionDate,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const cards = [
    {
      title: "My Courses",
      value: String(courseCount),
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
      value: String(upcomingClassCount),
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

  return (
    <div className="space-y-6">
      <section>
        <div>
          <h2 className="text-xl font-semibold">
            Your Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A quick look at your academic activity.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                Upcoming Classes
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Your next scheduled sessions.
              </p>
            </div>

            <Link
              href="/student/schedule"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View schedule
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
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
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingClasses.map((classSession) => (
                <div
                  key={classSession.id}
                  className="rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                        {classSession.course.code}
                      </span>

                      <h4 className="mt-2 truncate text-sm font-semibold">
                        {classSession.title}
                      </h4>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {classSession.course.name}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1.5 text-center">
                      <p className="text-[10px] font-medium text-primary">
                        {formatDate(classSession.startTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {formatTime(classSession.startTime)} –{" "}
                      {formatTime(classSession.endTime)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5" />
                      {classSession.teacher.firstName}{" "}
                      {classSession.teacher.lastName ?? ""}
                    </span>

                    {classSession.room && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {classSession.room}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Payment Due
              </h3>

              <p className="text-sm text-muted-foreground">
                Your outstanding payment balance.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold">
              ৳
              {pendingPayments.toLocaleString("en-BD")}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              View installments, due dates, and receipts.
            </p>

            <Link
              href="/student/payments"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View Payments
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>


        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Enrollment Requests
              </h3>

              <p className="text-sm text-muted-foreground">
                Track your course applications.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {enrollmentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No enrollment requests.
              </p>
            ) : (
              enrollmentRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {request.course.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {request.course.code}
                      </p>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {request.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted{" "}
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
