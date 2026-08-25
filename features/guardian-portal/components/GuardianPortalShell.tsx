"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import GuardianSidebar from "./GuardianSidebar";
import GuardianHeader from "./GuardianHeader";

type Props = {
  firstName: string;
  fullName: string;
  children: ReactNode;
};

export default function GuardianPortalShell({
  firstName,
  fullName,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <GuardianSidebar
          firstName={firstName}
          fullName={fullName}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <GuardianHeader
            firstName={firstName}
            fullName={fullName}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
