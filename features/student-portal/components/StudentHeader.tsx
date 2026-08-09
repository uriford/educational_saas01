"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
  UserCircle,
} from "lucide-react";

export default function StudentHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="lg:hidden">
          <p className="font-semibold">
            American Council
          </p>
          <p className="text-xs text-muted-foreground">
            Student Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />

          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </button>

        <Link
          href="/student/profile"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Profile"
        >
          <UserCircle className="size-5" />
        </Link>
      </div>
    </header>
  );
}
