import StudentAvatarUpload from "./StudentAvatarUpload";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

type StudentProfileProps = {
  student: {
    firstName: string;
    lastName: string | null;
    studentId: string;
    email: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    guardianName: string | null;
    guardianPhone: string | null;
    address: string | null;
    admissionDate: Date;
    status: string;
    avatar: string | null;
    organization: {
      name: string;
    };
    branch: {
      name: string;
    } | null;
  };
};

function formatDate(date: Date | null) {
  if (!date) return "Not provided";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function StudentProfile({
  student,
}: StudentProfileProps) {
  const fullName =
    `${student.firstName} ${student.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your personal and academic information.
          </p>
        </div>

        <a
          href="/student/profile/edit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Edit Profile
        </a>
      </div>

      <div className="relative overflow-hidden rounded-3xl border bg-primary text-primary-foreground shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        <div className="absolute -right-24 -top-32 size-96 rounded-full bg-white/10 blur-3xl dark:bg-primary/10" />
        <div className="absolute -left-32 bottom-[-180px] size-96 rounded-full bg-black/10 blur-3xl dark:bg-primary/5" />

        <div className="absolute right-[18%] top-8 size-32 rounded-full border border-white/10" />
        <div className="absolute right-[15%] top-3 size-44 rounded-full border border-white/5" />

        <div className="relative flex min-h-[220px] flex-col justify-end p-6 sm:min-h-[240px] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex min-w-0 items-end gap-4">
              <StudentAvatarUpload
                firstName={student.firstName}
                fullName={fullName}
                avatar={student.avatar}
              />

              <div className="min-w-0 pb-1">
                <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-white/75 dark:text-white/80">
                  {student.studentId}
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {student.status}
              </span>
            </div>

          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <UserCircle className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Personal Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Your personal details
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Detail
              icon={Mail}
              label="Email"
              value={student.email ?? "Not provided"}
            />

            <Detail
              icon={Phone}
              label="Phone"
              value={student.phone ?? "Not provided"}
            />

            <Detail
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDate(student.dateOfBirth)}
            />

            <Detail
              icon={UserCircle}
              label="Gender"
              value={student.gender ?? "Not provided"}
            />

            <div className="sm:col-span-2">
              <Detail
                icon={MapPin}
                label="Address"
                value={student.address ?? "Not provided"}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Academic Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Your enrollment details
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Detail
              icon={UserCircle}
              label="Student ID"
              value={student.studentId}
            />

            <Detail
              icon={UserCircle}
              label="Organization"
              value={student.organization.name}
            />

            <Detail
              icon={MapPin}
              label="Branch"
              value={student.branch?.name ?? "Organization-level"}
            />

            <Detail
              icon={CalendarDays}
              label="Admission Date"
              value={formatDate(student.admissionDate)}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <UserCircle className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Guardian Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Emergency and guardian contact
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Detail
              icon={UserCircle}
              label="Guardian Name"
              value={
                student.guardianName ??
                "Not provided"
              }
            />

            <Detail
              icon={Phone}
              label="Guardian Phone"
              value={
                student.guardianPhone ??
                "Not provided"
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
