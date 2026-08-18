import { MapPin, Phone, Building2 } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  isHeadquarters: boolean;
};

type Props = {
  branches: Branch[];
};

export default function PublicBranches({
  branches,
}: Props) {
  if (branches.length === 0) return null;

  return (
    <section className="bg-slate-950 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Find us
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Learning, wherever you are.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
            Explore our active locations and find the branch that works best
            for you.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur transition hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Building2 className="h-5 w-5" />
                </div>

                {branch.isHeadquarters ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Headquarters
                  </span>
                ) : null}
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                {branch.name}
              </h3>

              {branch.address ? (
                <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-400">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" />
                  {branch.address}
                </p>
              ) : null}

              {branch.phone ? (
                <p className="mt-3 flex gap-2 text-sm text-slate-400">
                  <Phone className="h-4 w-4 shrink-0" />
                  {branch.phone}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
