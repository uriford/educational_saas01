"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Plus,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

type WelcomeBannerProps = {
  userName: string;
  organizationName: string;
};

export default function WelcomeBanner({
  userName,
  organizationName,
}: WelcomeBannerProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-background shadow-sm">
      <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:p-8">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <CalendarDays className="size-4" />
            <span>{formatDate()}</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {getGreeting()}, {userName}
            <span className="ml-2 inline-block">👋</span>
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Welcome back. Here&apos;s what&apos;s happening at{" "}
            <span className="font-medium text-foreground">
              {organizationName}
            </span>{" "}
            today.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => router.push("/students/create")}
          className="w-full shrink-0 gap-2 rounded-lg shadow-sm sm:w-auto"
        >
          <Plus className="size-4" />
          New Student
        </Button>
      </div>

      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/5 blur-3xl" />
    </section>
  );
}
