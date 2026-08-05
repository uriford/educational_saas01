"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
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
export default function WelcomeBanner({ userName, organizationName }: WelcomeBannerProps) {
  return (
    <section className="flex flex-col justify-between gap-6 rounded-xl border bg-background p-6 shadow-sm md:flex-row md:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {userName} 👋
        </h2>

        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's what's happening at {organizationName} today.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">{formatDate()}</p>
      </div>

      <Button className="gap-2">
        <Plus className="size-4" />
        New Student
      </Button>
    </section>
  );
}
