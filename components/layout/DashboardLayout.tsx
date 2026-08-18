"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

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

      <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-muted/20">
        <AppHeader user={user} />

        <div className="flex-1">
          <div className="border-b bg-background/80 px-3 py-2.5 backdrop-blur sm:px-4 lg:px-6">
            <Breadcrumbs />
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            <div className="mx-auto w-full max-w-[1800px]">
              {children}
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
