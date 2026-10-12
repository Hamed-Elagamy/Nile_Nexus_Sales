import React from "react";
import { Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getServices } from "@/lib/actions/settings";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { ServicesCatalog } from "@/components/settings/services-catalog";

export async function generateMetadata() {
  const t = await getTranslations("servicesPage");
  return {
    title: `${t("title")} | Nile Nexus Sales`,
    description: t("subtitle"),
  };
}

export default async function ServicesPage() {
  const t = await getTranslations("servicesPage");
  const [profileRes, servicesRes] = await Promise.all([
    getCurrentUserProfile(),
    getServices(),
  ]);

  const profile = profileRes.success && profileRes.data ? profileRes.data : null;
  const userRole = profile?.role || "SALES";
  const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          <span>{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Services Catalog with Role-Enforced Controls */}
      <ServicesCatalog services={services} userRole={userRole} />
    </div>
  );
}
