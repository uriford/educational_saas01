"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/guardian",
    icon: LayoutDashboard,
  },
  {
    label: "My Students",
    href: "/guardian/students",
    icon: GraduationCap,
  },
  {
    label: "Progress",
    href: "/guardian/progress",
    icon: ClipboardCheck,
  },
  {
    label: "Attendance",
    href: "/guardian/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Schedule",
    href: "/guardian/schedule",
    icon: CalendarDays,
  },
  {
    label: "Payments",
    href: "/guardian/payments",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/guardian/reports",
    icon: FileText,
  },
  {
    label: "Messages",
    href: "/guardian/messages",
    icon: MessageCircle,
  },
];

type Props = {
  firstName: string;
  fullName: string;
};

export default function GuardianSidebar({
  firstName,
  fullName,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link
          href="/guardian"
          className="flex items-center gap-2 font-semibold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">American Council</p>
            <p className="text-xs text-muted-foreground">
              Guardian Portal
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 px-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Guardian
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {fullName || firstName}
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/guardian"
                ? pathname === "/guardian"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Guardian access
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Monitor your student&apos;s learning journey.
        </p>
      </div>
    </aside>
  );
}
