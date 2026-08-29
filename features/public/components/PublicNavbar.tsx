"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  GraduationCap,
  LogOut,
  UserCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type Props = {
  organizationName: string;
  logo?: string | null;
  hasBranches?: boolean;
};

type SessionUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  avatar?: string | null;
};

function getInitials(user: SessionUser) {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (user.name) {
    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return "U";
}

function getDisplayName(user: SessionUser) {
  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return fullName || user.name || user.email || "Account";
}

export default function PublicNavbar({
  organizationName,
  logo,
  hasBranches = false,
}: Props) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initials = organizationName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const session = await getSession();

        if (mounted) {
          setUser((session?.user as SessionUser | undefined) ?? null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const isStudent = user?.role === "STUDENT";
  const displayName = user ? getDisplayName(user) : "";
  const userInitials = user ? getInitials(user) : "";

  async function handleLogout() {
    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={organizationName}
        >
          {logo ? (
            <Image
              src={logo}
              alt={organizationName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-xs font-bold text-background shadow-lg shadow-slate-950/10">
              {initials}
            </div>
          )}

          <div className="hidden sm:block">
            <p className="text-sm font-bold tracking-tight text-foreground">
              {organizationName}
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Learning platform
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/"
            className="text-sm font-medium text-foreground"
          >
            Home
          </Link>

          <Link
            href="/student/courses"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Courses
          </Link>

          <Link
            href="/schedule"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Schedule
          </Link>

          <Link
            href="/announcements"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Announcements
          </Link>

          {hasBranches ? (
            <a
              href="#locations"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Locations
            </a>
          ) : null}
        </nav>

        {/* Account / CTA */}
        <div className="flex items-center gap-2">
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-muted hover:text-foreground sm:block"
              >
                Student Login
              </Link>

              <Link
                href="/student/courses"
                className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Get Started
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </>
          ) : null}

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Open ${displayName} account menu`}
                  />
                }
              >
                <Avatar className="size-10 border border-slate-200">
                  {user.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={displayName}
                      className="object-cover"
                    />
                  ) : null}

                  <AvatarFallback>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>

                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {isStudent ? "Student" : user.role ?? "Account"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {isStudent ? (
                  <DropdownMenuItem
                    render={
                      <Link href="/student">
                        <GraduationCap className="size-4" />
                        <span>Student Portal</span>
                      </Link>
                    }
                  />
                ) : null}

                {isStudent ? (
                  <DropdownMenuItem
                    render={
                      <Link href="/student/profile">
                        <UserCircle className="size-4" />
                        <span>My Profile</span>
                      </Link>
                    }
                  />
                ) : (
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard">
                        <GraduationCap className="size-4" />
                        <span>Dashboard</span>
                      </Link>
                    }
                  />
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

        </div>
      </div>
    </header>
  );
}
