"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LogOut,
  Settings,
  UserCircle,
  GraduationCap,
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
            className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Open ${fullName} account menu`}
          />
        }
      >
        <Avatar className="size-9">
          {user.avatar ? (
            <AvatarImage
              src={user.avatar}
              alt={fullName}
              className="object-cover"
            />
          ) : null}

          <AvatarFallback>
            {initials}
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
              {fullName}
            </span>

            <span className="truncate text-xs font-normal text-muted-foreground">
              {formatRole(user.role)}
            </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {isStudent && (
          <>
            <DropdownMenuItem
              render={
                <Link href="/student">
                  <GraduationCap className="size-4" />
                  <span>Student Portal</span>
                </Link>
              }
            />

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          render={
            <Link
              href={
                isStudent
                  ? "/student/profile"
                  : "/profile"
              }
            >
              <UserCircle className="size-4" />
              <span>Profile</span>
            </Link>
          }
        />

        <DropdownMenuItem
          render={
            <Link href="/settings">
              <Settings className="size-4" />
              <span>Settings</span>
            </Link>
          }
        />

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
  );
}
