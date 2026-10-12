import React from "react";
import { Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getServices, getLeadSources } from "@/lib/actions/settings";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { ServicesCatalog } from "@/components/settings/services-catalog";
import { LeadSourcesManager } from "@/components/settings/lead-sources-manager";
import { DeviceNotificationsSettings } from "@/components/settings/device-notifications-settings";

export async function generateMetadata() {
  const t = await getTranslations("settings");
  return {
    title: `${t("title")} | Nile Nexus Sales`,
    description: t("subtitle"),
  };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const [profileRes, servicesRes, leadSourcesRes] = await Promise.all([
    getCurrentUserProfile(),
    getServices(),
    getLeadSources(),
  ]);

  const profile = profileRes.success && profileRes.data ? profileRes.data : null;
  const userRole = profile?.role || "SALES";
  const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];
  const leadSources =
    leadSourcesRes.success && leadSourcesRes.data ? leadSourcesRes.data : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <span>{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* User Profile Section */}
      {profile && <UserProfileForm profile={profile} />}

      {/* Device Push & Realtime Notifications Settings */}
      <DeviceNotificationsSettings />

      {/* Services Section */}
      <div className="pt-2">
        <ServicesCatalog services={services} userRole={userRole} />
      </div>

      {/* Lead Sources Section */}
      <div className="pt-6 border-t border-border">
        <LeadSourcesManager leadSources={leadSources} userRole={userRole} />
      </div>
    </div>
  );
}
