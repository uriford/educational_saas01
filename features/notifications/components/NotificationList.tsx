"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Trash2 } from "lucide-react";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  deleteNotificationAction,
} from "../actions/notification.actions";

import { Button } from "@/components/ui/button";
import type { NotificationItem } from "../types";

type Props = {
  notifications: NotificationItem[];
};

export default function NotificationList({
  notifications: initialNotifications,
}: Props) {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  async function markRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    await markNotificationReadAction(id);
  }

  async function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    await markAllNotificationsReadAction();
  }

  async function remove(id: string) {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );

    await deleteNotificationAction(id);
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Notifications
          </h2>

          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center">
          <Bell className="mb-3 h-8 w-8 text-muted-foreground" />

          <p className="font-medium">
            No notifications
          </p>

          <p className="text-sm text-muted-foreground">
            You&rsquo;re all caught up.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-xl border">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-4 p-4 ${
                !notification.isRead ? "bg-muted/40" : ""
              }`}
            >
              <div className="mt-1 shrink-0">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                {notification.href ? (
                  <Link
                    href={notification.href}
                    onClick={() =>
                      !notification.isRead &&
                      markRead(notification.id)
                    }
                    className="font-medium hover:underline"
                  >
                    {notification.title}
                  </Link>
                ) : (
                  <p className="font-medium">
                    {notification.title}
                  </p>
                )}

                <p className="mt-1 text-sm text-muted-foreground">
                  {notification.message}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(
                    notification.createdAt,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex shrink-0 items-start gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Mark as read"
                    onClick={() => markRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={() => remove(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}