import { Notifications } from "@/components/notifications";
import PageTitle from "@/components/page-title";

export default function NotificationsPage() {
  return (
    <div className="p-4">
      <PageTitle>Notifications</PageTitle>
      <Notifications />
    </div>
  );
}
