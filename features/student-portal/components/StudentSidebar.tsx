"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


const navigation = [
  {
    label:"Overview",
    href:"/student",
    icon:LayoutDashboard,
  },
  {
    label:"My Courses",
    href:"/student/courses",
    icon:BookOpen,
  },
  {
    label:"Explore Courses",
    href:"/student/explore-courses",
    icon:GraduationCap,
  },
  {
    label:"Routine",
    href:"/student/routine",
    icon:CalendarDays,
  },
  {
    label:"Schedule",
    href:"/student/schedule",
    icon:CalendarDays,
  },
  {
    label:"Results",
    href:"/student/results",
    icon:ClipboardCheck,
  },
  {
    label:"Payments",
    href:"/student/payments",
    icon:CreditCard,
  },
  {
    label:"Announcements",
    href:"/student/announcements",
    icon:Megaphone,
  },
  {
    label:"Chat",
    href:"/student/chat",
    icon:MessageCircle,
  },
  {
    label:"Profile",
    href:"/student/profile",
    icon:UserCircle,
  },
];


type Props={
 firstName:string;
 fullName:string;
 avatar:string|null;
};


export default function StudentSidebar({
 firstName,
 fullName,
 avatar,
}:Props){

 const pathname=usePathname();


 return (
 <Sidebar>

  <SidebarHeader className="border-b px-4 py-4">

    <div className="flex items-center gap-3">

      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-5"/>
      </div>

      <div>
        <p className="font-semibold">
          American Council
        </p>

        <p className="text-xs text-muted-foreground">
          Student Portal
        </p>
      </div>

    </div>

  </SidebarHeader>


  <SidebarContent className="px-2 py-3">

   <SidebarMenu>

    {navigation.map((item)=>{

      const Icon=item.icon;

      const active =
        item.href==="/student"
        ? pathname==="/student"
        : pathname.startsWith(item.href);


      return (

      <SidebarMenuItem key={item.href}>

       <Link
        href={item.href}
        className={[
          "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")}
       >

        <Icon className="size-4"/>

        <span>
          {item.label}
        </span>

       </Link>

      </SidebarMenuItem>

      );

    })}

   </SidebarMenu>

  </SidebarContent>


  <SidebarFooter className="border-t p-3">

    <Link
      href="/student/profile"
      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
    >

    {
      avatar
      ?
      <Image
        src={avatar}
        alt={fullName}
        width={36}
        height={36}
        className="size-9 rounded-full object-cover"
      />
      :
      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {firstName[0]}
      </div>
    }


    <div className="min-w-0">

      <p className="truncate text-sm font-medium">
        {fullName}
      </p>

      <p className="text-xs text-muted-foreground">
        Student
      </p>

    </div>

    </Link>


  </SidebarFooter>


 </Sidebar>
 );

}