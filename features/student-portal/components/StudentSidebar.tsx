"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserCircle,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    label: "My Courses",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "Routine",
    href: "/student/routine",
    icon: CalendarDays,
  },
  {
    label: "Schedule",
    href: "/student/schedule",
    icon: CalendarDays,
  },
  {
    label: "Results",
    href: "/student/results",
    icon: ClipboardCheck,
  },
  {
    label: "Announcements",
    href: "/student/announcements",
    icon: Megaphone,
  },
  {
    label: "Profile",
    href: "/student/profile",
    icon: UserCircle,
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
      <div className="flex h-full min-h-screen flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>

          <div>
            <p className="font-semibold leading-none">
              American Council
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Student Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/student"
                ? pathname === "/student"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/student/profile"
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="size-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                My Account
              </p>
              <p className="text-xs text-muted-foreground">
                View profile
              </p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
