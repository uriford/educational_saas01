"use client";
import Image from "next/image";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Bell,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

type StudentHeaderProps = {
  firstName: string;
  fullName: string;
  avatar: string | null;
};

export default function StudentHeader({
  firstName,
  fullName,
  avatar,
}: StudentHeaderProps) {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">

        <SidebarTrigger className="rounded-lg" />

        <div>
          <p className="font-semibold">American Council</p>
          <p className="text-xs text-muted-foreground">
            Student Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full transition hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />

          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </button>

        {/* Theme */}
        <ThemeToggle />

        {/* Student Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex size-9 items-center justify-center rounded-full outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`${fullName} profile menu`}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={fullName}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-border">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {open && (
            <>
              {/* Click-away area */}
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
              />

              {/* Dropdown */}
              <div
                role="menu"
                className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border bg-popover shadow-xl"
              >
                {/* Student identity */}
                <div className="border-b bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={fullName}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary ring-2 ring-border">
                        {firstName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {fullName}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Student
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <Link
                    href="/student/profile"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    <User className="size-4 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/student/profile/edit"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </Link>

                  <div className="my-2 border-t" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
