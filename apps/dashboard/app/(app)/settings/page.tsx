"use client";

import PageTitle from "@/components/page-title";
import { GeneralSettings } from "./components/general";

import { useSessionStore } from "@/store/use-session";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TeamSettings } from "./components/team";
import { Billings } from "./components/billings";

export default function SettingsPage() {
  const { user } = useSessionStore();
  return (
    <section className="p-4">
      <PageTitle>Settings</PageTitle>
      <div className="space-y-8 mt-6">
        {!user ? (
          <Skeleton className="h-16" />
        ) : (
          <GeneralSettings name={user?.name} />
        )}
        <TeamSettings />
        <Billings />
      </div>
    </section>
  );
}
