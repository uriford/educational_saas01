import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isHeadquarters: boolean;
};

type Props = {
  organization: {
    name: string;
    email: string | null;
    phone: string | null;
    logo: string | null;
  };
  branches: Branch[];
};

export default function PublicContact({
  organization,
  branches,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Contact
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Get in touch with {organization.name}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Have a question about courses, admissions, schedules, or your
            learning journey? Reach out to us and our team will be happy to
            help.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {organization.email ? (
            <a
              href={`mailto:${organization.email}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <Mail className="h-6 w-6 text-slate-950" />
              <p className="mt-5 text-sm font-semibold text-slate-500">
                Email
              </p>
              <p className="mt-2 break-all font-semibold text-slate-950">
                {organization.email}
              </p>
            </a>
          ) : null}

          {organization.phone ? (
            <a
              href={`tel:${organization.phone}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <Phone className="h-6 w-6 text-slate-950" />
              <p className="mt-5 text-sm font-semibold text-slate-500">
                Phone
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {organization.phone}
              </p>
            </a>
          ) : null}

          {branches.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <MapPin className="h-6 w-6 text-slate-950" />
              <p className="mt-5 text-sm font-semibold text-slate-500">
                Locations
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {branches.length} {branches.length === 1 ? "location" : "locations"}
              </p>
            </div>
          ) : null}
        </div>

        {branches.length > 0 ? (
          <section className="mt-16">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Our locations
              </h2>
              <p className="mt-2 text-slate-600">
                Find the branch that is most convenient for you.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {branch.name}
                      </h3>

                      {branch.isHeadquarters ? (
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Headquarters
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    {branch.address ? (
                      <p className="flex gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{branch.address}</span>
                      </p>
                    ) : null}

                    {branch.email ? (
                      <a
                        href={`mailto:${branch.email}`}
                        className="flex gap-3 transition hover:text-slate-950"
                      >
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{branch.email}</span>
                      </a>
                    ) : null}

                    {branch.phone ? (
                      <a
                        href={`tel:${branch.phone}`}
                        className="flex gap-3 transition hover:text-slate-950"
                      >
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{branch.phone}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
