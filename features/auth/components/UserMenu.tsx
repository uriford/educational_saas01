"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LogOut,
  Settings,
  UserCircle,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type UserMenuProps = {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
  };
};

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export default function UserMenu({
  user,
}: UserMenuProps) {
  const fullName =
    `${user.firstName} ${user.lastName}`.trim();

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      .toUpperCase();

  const isStudent = user.role === "STUDENT";

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group rounded-full outline-none ring-offset-background transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Open ${fullName} account menu`}
          />
        }
      >
        <Avatar className="size-9 border border-border/60 shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-md">
          {user.avatar ? (
            <AvatarImage
              src={user.avatar}
              alt={fullName}
              className="object-cover"
            />
          ) : null}

          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[300px] overflow-hidden rounded-2xl border-border/60 bg-popover p-0 shadow-xl"
      >
        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary/[0.08] via-background to-background px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 shrink-0 border-2 border-background shadow-md ring-1 ring-border/50">
              {user.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={fullName}
                  className="object-cover"
                />
              ) : null}

              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">
                {fullName}
              </p>

              <div className="mt-1 inline-flex max-w-full items-center rounded-full bg-primary/10 px-2 py-0.5">
                <span className="truncate text-[11px] font-medium text-primary">
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Account actions */}
        <div className="p-2">
          {isStudent && (
            <>
              <DropdownMenuItem
                className="cursor-pointer rounded-xl px-3 py-2.5"
                render={
                  <Link href="/student">
                    <div className="flex w-full items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <GraduationCap className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          Student Portal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Open your student dashboard
                        </p>
                      </div>

                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                }
              />

              <DropdownMenuSeparator className="my-2" />
            </>
          )}

          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-3 py-2.5"
            render={
              <Link
                href={
                  isStudent
                    ? "/student/profile"
                    : "/profile"
                }
              >
                <div className="flex w-full items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <UserCircle className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      My Profile
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View and manage your profile
                    </p>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            }
          />

          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-3 py-2.5"
            render={
              <Link href="/settings">
                <div className="flex w-full items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Settings className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Settings
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Manage your preferences
                    </p>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            }
          />
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer rounded-xl px-3 py-2.5"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <LogOut className="size-4" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  Log out
                </p>
                <p className="text-xs opacity-70">
                  Sign out of your account
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
