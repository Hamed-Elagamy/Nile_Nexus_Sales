import React from "react";
import { getTranslations } from "next-intl/server";
import { getCoffexLeads } from "@/lib/actions/coffex";
import { CoffexClientPage } from "./coffex-client-page";

export const metadata = {
  title: "كوفيكس للمبيعات الميدانية | Nile Nexus Sales",
  description: "نموذج تسجيل العملاء المحتملين الميداني لكافيهات ومحامص القهوة - مشروع كوفيكس",
};

export default async function CoffexPage() {
  const result = await getCoffexLeads();

  const leads = result.success && result.data ? result.data.leads : [];
  const metrics = result.success && result.data ? result.data.metrics : {
    totalLeads: 0,
    hotLeadsCount: 0,
    totalBranchesCount: 0,
    estimatedPipelineValue: 0,
    demosScheduledCount: 0,
  };

  return <CoffexClientPage initialLeads={leads} initialMetrics={metrics} />;
}
