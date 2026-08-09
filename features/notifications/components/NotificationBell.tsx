"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // Ignore notification polling errors.
      }
    }

    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}