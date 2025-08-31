"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavLink = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({
  navLinks,
  navMain,
}: {
  navLinks: NavLink[];
  navMain: NavMainItem[];
  isLoading: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarMenu>
          {navLinks.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link href={item.url} key={item.title}>
                <SidebarMenuItem data-active={isActive}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Utility</SidebarGroupLabel>
        <SidebarMenu>
          {navMain.map((item) => {
            const isParentActive =
              pathname === item.url ||
              item.items?.some((subItem) => pathname === subItem.url);

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isParentActive}
                className="group/collapsible"
              >
                <SidebarMenuItem data-active={isParentActive}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            data-active={isSubActive}
                          >
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
