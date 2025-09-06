"use client"

import {
  SidebarGroup,

  SidebarMenu,
  SidebarMenuButton,

} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavMain({navDetails}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {navDetails.map((item) => {
          const isActive = pathname === item.url

          return (
            <SidebarMenuButton
              asChild
              key={item.title}
              tooltip={item.title}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              <Link href={item.url}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
