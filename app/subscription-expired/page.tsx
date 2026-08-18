import Link from "next/link";
import { Clock3, ShieldAlert } from "lucide-react";

export default function SubscriptionExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Subscription Expired
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your organization&apos;s trial or subscription has expired.
          Please contact your platform administrator to continue using
          the platform.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          Access is currently unavailable.
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
