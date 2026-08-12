"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

type Props = {
  children: React.ReactNode;
  organization: {
    name: string;
    logo: string | null;
  };
  user: {
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
  };
};

export default function DashboardLayout({
  children,
  organization,
  user,
}: Props) {
  return (
    <SidebarProvider>
      <AppSidebar
        organization={organization}
        user={user}
      />

      <main className="flex min-h-screen flex-1 flex-col">
        <AppHeader user={user} />

        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
