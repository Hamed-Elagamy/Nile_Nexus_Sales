import React from "react";
import { Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getServices, getLeadSources } from "@/lib/actions/settings";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { ServicesCatalog } from "@/components/settings/services-catalog";
import { LeadSourcesManager } from "@/components/settings/lead-sources-manager";

export const metadata = {
  title: "الإعدادات العامة والملف الشخصي | Nile Nexus Sales",
  description: "إعدادات الملف الشخصي والنظام وكتالوج الخدمات ومصادر العملاء",
};

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const [profileRes, servicesRes, leadSourcesRes] = await Promise.all([
    getCurrentUserProfile(),
    getServices(),
    getLeadSources(),
  ]);

  const profile = profileRes.success && profileRes.data ? profileRes.data : null;
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

      {/* Services Section */}
      <div className="pt-2">
        <ServicesCatalog services={services} />
      </div>

      {/* Lead Sources Section */}
      <div className="pt-6 border-t border-border">
        <LeadSourcesManager leadSources={leadSources} />
      </div>
    </div>
  );
}
