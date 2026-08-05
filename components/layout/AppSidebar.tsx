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
import { siteConfig } from "@/config/site";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
      AC
    </div>

    <div className="flex flex-col">
      <h2 className="text-sm font-semibold">
        {siteConfig.name}
      </h2>

      <p className="text-xs text-muted-foreground">
        {siteConfig.description}
      </p>
    </div>
  </div>
</SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    onClick={() => router.push(item.href)}
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
            <AvatarFallback>MM</AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium">Muntasir Mamun</p>

            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
