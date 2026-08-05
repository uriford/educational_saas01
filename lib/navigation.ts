import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Teachers",
    url: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Bell,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];