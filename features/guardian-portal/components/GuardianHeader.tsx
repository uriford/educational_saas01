"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type Props = {
  firstName: string;
  fullName: string;
};

export default function GuardianHeader({
  firstName,
  fullName,
}: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <p className="text-sm font-medium">
            Welcome, {firstName}
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Guardian Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{fullName}</p>
          <p className="text-xs text-muted-foreground">Guardian</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
