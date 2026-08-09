"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Bell,
  LogOut,
  UserCircle,
} from "lucide-react";

export default function StudentHeader() {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-semibold">American Council</p>
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

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
