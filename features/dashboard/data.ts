import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserPlus,
  Megaphone,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";

import type { ActivityData, AnnouncementData, QuickActionData, StatsCardData, UpcomingClassData } from "./types";

export const dashboardStats: StatsCardData[] = [
  {
    title: "Total Students",
    value: 1245,
    trend: {
      value: "+18%",
      direction: "up",
    },
    description: "Compared to last week",
    icon: Users,
  },
  {
    title: "Teachers",
    value: 42,
    trend: {
      value: "+5%",
      direction: "up",
    },
    description: "New instructors joined",
    icon: GraduationCap,
  },
  {
    title: "Courses",
    value: 15,
    trend: {
      value: "-2%",
      direction: "down",
    },
    description: "Active courses",
    icon: BookOpen,
  },
  {
    title: "Revenue",
    value: "৳4.5L",
    trend: {
      value: "+12%",
      direction: "up",
    },
    description: "Monthly income",
    icon: DollarSign,
  },
];


export const quickActions: QuickActionData[] = [
  {
    title: "Add Student",
    description: "Register a new student",
    href: "/students/new",
    icon: UserPlus,
  },
  {
    title: "Add Teacher",
    description: "Create a teacher profile",
    href: "/teachers/new",
    icon: GraduationCap,
  },
  {
    title: "Announcement",
    description: "Publish an announcement",
    href: "/announcements/new",
    icon: Megaphone,
  },
  {
    title: "Schedule Class",
    description: "Create a new class schedule",
    href: "/classes/new",
    icon: CalendarPlus,
  },
];

export const recentActivities: ActivityData[] = [
  {
    title: "New Student Registered",
    description: "Rahim Ahmed enrolled in IELTS Batch 14",
    time: "2 minutes ago",
    icon: UserPlus,
  },
  {
    title: "Announcement Published",
    description: "Holiday notice published",
    time: "25 minutes ago",
    icon: Megaphone,
  },
  {
    title: "Course Created",
    description: "IELTS Advanced Batch",
    time: "Yesterday",
    icon: BookOpen,
  },
  {
    title: "Class Scheduled",
    description: "Speaking Practice - Room A",
    time: "2 days ago",
    icon: CalendarClock,
  },
];

export const upcomingClasses: UpcomingClassData[] = [
  {
    title: "IELTS Speaking",
    teacher: "John Smith",
    room: "Room A",
    startTime: "09:00",
    endTime: "10:30",
  },
  {
    title: "Grammar Basics",
    teacher: "Sarah Ahmed",
    room: "Room C",
    startTime: "11:00",
    endTime: "12:30",
  },
  {
    title: "Vocabulary Practice",
    teacher: "Michael Lee",
    room: "Room B",
    startTime: "02:00",
    endTime: "03:30",
  },
];

export const recentAnnouncements: AnnouncementData[] = [
  {
    title: "IELTS Mock Test",
    description: "Mock test will begin at 9:00 AM.",
    date: "Friday • 10 Aug",
  },
  {
    title: "Holiday Notice",
    description: "Office will remain closed.",
    date: "Thursday • 14 Aug",
  },
  {
    title: "New IELTS Batch",
    description: "Admission is now open.",
    date: "Monday • 18 Aug",
  },
];