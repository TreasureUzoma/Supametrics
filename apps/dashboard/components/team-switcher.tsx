"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { useWorkspace } from "@/store/use-workspace";

export function TeamSwitcher({
  teams,
  isLoading,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    id: string;
    isPersonal?: boolean;
  }[];
  isLoading: boolean;
}) {
  const { isMobile } = useSidebar();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  // pick default workspace if none is selected yet
  React.useEffect(() => {
    if (!activeWorkspace && teams.length > 0) {
      setActiveWorkspace(teams[0]!);
    }
  }, [activeWorkspace, teams, setActiveWorkspace]);

  const activeTeam = activeWorkspace ?? teams[0];
  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs capitalize">
                  {isLoading ? <Skeleton /> : activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => setActiveWorkspace(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span>{team.name}</span>
                  {team.isPersonal && (
                    <span className="text-muted-foreground text-xs">
                      (Personal)
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border border-border bg-transparent">
                <Plus className="size-4" />
              </div>
              <Link
                href="/new/team"
                className="text-muted-foreground font-medium"
              >
                Add team
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
