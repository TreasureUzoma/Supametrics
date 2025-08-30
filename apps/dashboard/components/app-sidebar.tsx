"use client";

import { useSession } from "@/store/use-session";
import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Sparkle,
  Command,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  Activity,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@repo/ui/components/ui/logo";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, isError } = useSession();

  // default placeholder data (so UI doesn’t break)
  const data = {
    user: {
      name: user?.name ?? <Skeleton />,
      email: user?.email ?? "loading@example.com",
      avatar: user?.email
        ? `https://avatar.vercel.sh/${user.email}`
        : `https://avatar.vercel.sh/placeholder`,
    },
    teams: [
      {
        name: "My Workspace",
        logo: AudioWaveform,
        plan: user?.subscriptionType,
        id: user?.uuid,
        isPersonal: true,
      },
      {
        name: "Supametrics",
        logo: Command,
        plan: "Enterprise",
        id: "team-2",
      },
      {
        name: "Sparka",
        logo: Command,
        plan: "Pro",
        id: "team-3",
      },
    ],
    navLinks: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Activity",
        url: "/activity",
        icon: Activity,
      },
      {
        title: "AI",
        url: "/ai",
        icon: Sparkle,
      },
      {
        title: "Support",
        url: "/contact",
        icon: LifeBuoy,
      },
    ],
    navMain: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          { title: "General", url: "/settings/general" },
          { title: "Team", url: "/settings/teams" },
          { title: "Billing", url: "/settings/billing" },
          { title: "Limits", url: "/settings/limits" },
        ],
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: BookOpen,
        items: [
          { title: "Introduction", url: "/docs/introduction" },
          { title: "Installations", url: "/docs/introduction/installation" },
          { title: "Setup", url: "/docs/introduction/setup" },
          {
            title: "Viewing Analytics",
            url: "/docs/introduction/viewanalytics",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="w-full p-2 my-1 group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>
        <div className="hidden w-full p-2 my-1 group-data-[collapsible=icon]:block">
          <Logo showText={false} />
        </div>
        <TeamSwitcher teams={data.teams} isLoading={isLoading} />
      </SidebarHeader>

      <SidebarContent className="!font-medium">
        <NavMain
          navLinks={data.navLinks}
          navMain={data.navMain}
          isLoading={isLoading}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} isLoading={isLoading} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
