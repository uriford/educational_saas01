"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { pageTitles } from "@/config/page-titles";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import UserMenu from "@/features/auth/components/UserMenu";

type Props = {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
  };
};

export default function AppHeader({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="shrink-0 rounded-lg" />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 sm:block"
        />

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {pageTitles[pathname] ?? "Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border-muted-foreground/20 bg-muted/30 pl-9 text-sm transition-colors focus-visible:bg-background xl:w-64"
          />
        </div>

        <NotificationBell />
        <ThemeToggle />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 sm:block"
        />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
