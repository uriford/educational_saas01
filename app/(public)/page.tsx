import { PublicService } from "@/features/public/services/public.service";
import PublicHome from "@/features/public/components/PublicHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const slug =
    process.env.PUBLIC_ORGANIZATION_SLUG || "american-council";

  const data = await PublicService.getHomePageData(slug);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">
            !
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Organization unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            This learning platform is currently unavailable. Please try again
            later.
          </p>
        </div>
      </main>
    );
  }

  return <PublicHome data={data} />;
}
