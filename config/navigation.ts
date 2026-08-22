import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  MessageCircle,
  CreditCard,
  ClipboardCheck,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

export const platformItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    title: "Platform Admins",
    href: "/platform-admins",
    icon: Users,
  },
];

export const organizationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Enrollment Requests",
    href: "/enrollment-requests",
    icon: ClipboardCheck,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageCircle,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Bell,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const items = organizationItems;
