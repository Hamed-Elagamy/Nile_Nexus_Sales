import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getNotifications } from "@/lib/actions/notifications";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notifications");
  return {
    title: `${t("title")} | Nile Nexus Sales`,
    description: t("subtitle"),
  };
}

export default async function NotificationsPage() {
  const res = await getNotifications(50);
  const initialNotifications = res.success && res.data ? res.data : [];

  return <NotificationsClient initialNotifications={initialNotifications} />;
}
