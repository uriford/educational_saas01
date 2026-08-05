"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>

      <AppSidebar />

      <main className="flex min-h-screen flex-1 flex-col">

        <AppHeader />

        <div className="flex-1 p-6">
          {children}
        </div>

      </main>

    </SidebarProvider>
  );
}