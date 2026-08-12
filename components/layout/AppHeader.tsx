"use client";

import { usePathname } from "next/navigation";
import { Moon, Search } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { pageTitles } from "@/config/page-titles";
import NotificationBell from "@/features/notifications/components/NotificationBell";

type Props = {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
  };
};

export default function AppHeader({
  user,
}: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <h1 className="text-xl font-semibold">
          {pageTitles[pathname] ?? "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search..."
            className="w-72 pl-9"
          />
        </div>

        <NotificationBell />

        <Button variant="ghost" size="icon">
          <Moon className="size-5" />
        </Button>

        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback>
            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
