import { LucideIcon } from "lucide-react";

export type TrendDirection = "up" | "down" | "neutral";

export interface Trend {
  value: string;
  direction: TrendDirection;
}

export interface StatsCardData {
  title: string;
  value: React.ReactNode;
  description: string;
  trend: Trend;
  icon: LucideIcon;
}

export interface QuickActionData {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export interface ActivityData {
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
}

export interface UpcomingClassData {
  title: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
}

export interface AnnouncementData {
  title: string;
  description: string;
  date: string;
}