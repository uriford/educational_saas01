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
    };
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View your personal and academic information.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="h-32 bg-primary" />

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={fullName}
                  className="size-24 rounded-2xl border-4 border-card object-cover shadow-md"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-3xl font-bold text-primary shadow-md">
                  {student.firstName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="pb-1">
                <h2 className="text-xl font-bold">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {student.studentId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600">
                <span className="size-1.5 rounded-full bg-green-500" />
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
              value={student.branch.name}
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
