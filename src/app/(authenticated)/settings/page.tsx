import React from "react";
import { Settings } from "lucide-react";
import { getServices, getLeadSources } from "@/lib/actions/settings";
import { ServicesCatalog } from "@/components/settings/services-catalog";
import { LeadSourcesManager } from "@/components/settings/lead-sources-manager";

export const metadata = {
  title: "الإعدادات العامة | Nile Nexus Sales",
  description: "إعدادات النظام وكتالوج الخدمات ومصادر العملاء",
};

export default async function SettingsPage() {
  const [servicesRes, leadSourcesRes] = await Promise.all([
    getServices(),
    getLeadSources(),
  ]);

  const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];
  const leadSources =
    leadSourcesRes.success && leadSourcesRes.data ? leadSourcesRes.data : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <span>إعدادات النظام (Settings)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          إدارة كتالوج الخدمات والأسعار المرجعية ومصادر العملاء التسويقية ⚙️
        </p>
      </div>

      {/* Services Section */}
      <ServicesCatalog services={services} />

      {/* Lead Sources Section */}
      <div className="pt-6 border-t border-border">
        <LeadSourcesManager leadSources={leadSources} />
      </div>
    </div>
  );
}
