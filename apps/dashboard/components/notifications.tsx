// import { notifications } from "@/data/dummy";
// import { timeAgo } from "@repo/ui/lib/utils";
// import { ArrowRight } from "lucide-react";
// import Link from "next/link";

export const Notifications = () => {
  return (
    <div className="flex flex-col mt-1">
      {/*notifications && notifications.length > 1 ? (
        notifications.map((notification) => (
          <Link
            href={notification.contentLink ?? "#"}
            key={notification.id}
            className="border-b border-border hover:bg-accent py-3 text-sm"
          >
            <div className="flex gap-2">
              <span className="bold">
                {notification.isRead == false && "•"}
              </span>
              <div className="w-full">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="line-clap-2 text-subtitle">
                  {notification.description}
                </p>
                <div className="flex_between text-xs">
                  <p>{timeAgo(notification.time)}</p>
                  {notification.contentLink && <ArrowRight size={14} />}
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <NoNotifications />
      )*/}
      <NoNotifications />
    </div>
  );
};

const NoNotifications = () => {
  return (
    <section className="min-h-[80vh] text-center flex_center font-medium">
      <div className="flex flex-col space-y-4">
        <p className="font-bold text-8xl">(:</p>
        <p className="text-subtitle text-sm">No notifications found</p>
      </div>
    </section>
  );
};
