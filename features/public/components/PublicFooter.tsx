import Link from "next/link";

type Props = {
  organizationName: string;
  email: string | null;
  phone: string | null;
};

export default function PublicFooter({
  organizationName,
  email,
  phone,
}: Props) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-xl font-bold tracking-tight text-slate-950">
              {organizationName}
            </p>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              A modern learning environment designed to help students learn,
              grow, and achieve more.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">Explore</p>
            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <Link className="block hover:text-slate-950" href="/courses">
                Courses
              </Link>
              <Link className="block hover:text-slate-950" href="/schedule">
                Schedule
              </Link>
              <Link
                className="block hover:text-slate-950"
                href="/announcements"
              >
                Announcements
              </Link>
              <Link className="block hover:text-slate-950" href="/about">
                About
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">Contact</p>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              {email ? <p>{email}</p> : null}
              {phone ? <p>{phone}</p> : null}

              <Link
                className="inline-block font-semibold text-slate-950"
                href="/contact"
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {organizationName}. All rights
            reserved.
          </p>

          <Link href="/login" className="hover:text-slate-700">
            Student Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
