import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, FileText } from "lucide-react";
import { getProposals } from "@/lib/actions/proposals";
import { ProposalsClient } from "@/components/proposals/proposals-client";

export const metadata = {
  title: "Proposals | Nile Nexus Sales",
  description: "Manage commercial proposals, quotations, and client agreements",
};

export default async function ProposalsPage() {
  const t = await getTranslations("proposals");
  const proposalsRes = await getProposals({ page: 1, pageSize: 20 });
  const initialData = proposalsRes.success && proposalsRes.data ? proposalsRes.data : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>{t("pageTitle")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span>{t("newProposalButton")}</span>
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <ProposalsClient initialData={initialData} />
    </div>
  );
}
