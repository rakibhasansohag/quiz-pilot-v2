"use client"

import {
  SidebarGroup,

  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserStar } from "lucide-react";

export function NavMain({ navDetails, adminNavDetails }) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {
          navDetails.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuButton
                asChild
                key={item.title}
                tooltip={item.title}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors", isActive ? "!bg-primary !text-white" : "hover:bg-muted hover:text-foreground")}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )
          })
        }

        <div className="flex items-center mt-5 mb-2">
          <div className="border-b flex-1"></div>
          <div className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="px-4 border flex-1"
              >
                <UserStar />
                <span className="text-xs">Admin Section</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
          <div className="border-b flex-1"></div>
        </div>


        {
          adminNavDetails.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuButton
                asChild
                key={item.title}
                tooltip={item.title}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors", isActive ? "!bg-primary !text-white" : "hover:bg-muted hover:text-foreground")}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )
          })
        }
      </SidebarMenu>

    </SidebarGroup>
  );
}
