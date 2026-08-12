"use client";

import { usePathname, useRouter } from "next/navigation";
import { items } from "@/config/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";

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

function getInitials(
  firstName: string,
  lastName: string,
) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase();
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export default function AppSidebar({
  organization,
  user,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const fullName =
    `${user.firstName} ${user.lastName}`.trim();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              organization.name
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {organization.name}
            </h2>

            <p className="text-xs text-muted-foreground">
              Education Platform
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    onClick={() =>
                      router.push(item.href)
                    }
                  >
                    <item.icon className="size-5" />

                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(
                user.firstName,
                user.lastName,
              )}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {fullName}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {formatRole(user.role)}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
