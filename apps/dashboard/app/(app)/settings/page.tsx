"use client";

import PageTitle from "@/components/page-title";
import { GeneralSettings } from "./components/general";

import { useSessionStore } from "@/store/use-session";

export default function SettingsPage() {
  const { user, loading } = useSessionStore();
  return (
    <section className="p-4">
      <PageTitle>Settings</PageTitle>
      <div className="space-y-8 mt-6">
        <GeneralSettings name={user?.name} />
      </div>
    </section>
  );
}
