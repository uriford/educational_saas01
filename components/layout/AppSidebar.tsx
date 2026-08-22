"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  platformItems,
  organizationItems,
} from "@/config/navigation";

type Props = {
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

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getOrganizationInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppSidebar({
  organization,
  user,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems =
    user.role === "SUPER_ADMIN"
      ? platformItems
      : organizationItems;

  const fullName =
    `${user.firstName} ${user.lastName}`.trim();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            {organization.logo ? (
              <Image
                src={organization.logo}
                alt={organization.name}
                width={40}
                height={40}
                className="size-full object-cover"
              />
            ) : (
              getOrganizationInitials(organization.name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              {organization.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Education Platform
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => router.push(item.href)}
                      className="h-10 rounded-lg px-3 text-[13px] font-medium transition-all duration-200 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm data-active:hover:bg-primary data-active:hover:text-primary-foreground"
                    >
                      <item.icon className="size-[18px]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-auto w-full min-w-0 justify-start gap-3 rounded-lg px-2.5 py-2.5 hover:bg-sidebar-accent"
              >
                <Avatar className="size-9 shrink-0">
                  {user.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}

                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(
                      user.firstName,
                      user.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {fullName}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {formatRole(user.role)}
                  </p>
                </div>

                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            }
          />

          <DropdownMenuContent
            side="top"
            align="end"
            className="w-56"
          >
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
            >
              <Settings />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
