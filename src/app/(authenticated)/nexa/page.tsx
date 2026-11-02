import React from "react";
import { getTranslations } from "next-intl/server";
import { getNexaLeads } from "@/lib/actions/nexa";
import { NexaClientPage } from "./nexa-client-page";

export async function generateMetadata() {
  const t = await getTranslations("nexa");
  return {
    title: `${t("pageTitle")} | Tammlo Sales`,
    description: t("pageSubtitle"),
  };
}

export default async function NexaPage() {
  const result = await getNexaLeads();

  const leads = result.success && result.data ? result.data.leads : [];
  const metrics = result.success && result.data ? result.data.metrics : {
    totalLeads: 0,
    hotLeadsCount: 0,
    totalBranchesCount: 0,
    estimatedPipelineValue: 0,
    demosScheduledCount: 0,
  };

  return <NexaClientPage initialLeads={leads} initialMetrics={metrics} />;
}
