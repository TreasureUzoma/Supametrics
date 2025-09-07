import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Bell } from "lucide-react";
import AddNewDropdown from "@/components/add-new-dropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex justify-end w-full pr-4 gap-4">
            <Link href="/notifications">
              <Button variant="outline">
                <Bell />
              </Button>
            </Link>
            <AddNewDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
