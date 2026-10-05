import React from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getProposals } from "@/lib/actions/proposals";
import { ProposalsClient } from "@/components/proposals/proposals-client";

export const metadata = {
  title: "عروض الأسعار (Proposals) | Nile Nexus Sales",
  description: "إدارة عروض الأسعار والمقترحات المالية والفنية للعملاء",
};

export default async function ProposalsPage() {
  const proposalsRes = await getProposals({ page: 1, pageSize: 20 });
  const initialData = proposalsRes.success && proposalsRes.data ? proposalsRes.data : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>عروض الأسعار (Proposals)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إعداد ومتابعة عروض الأسعار والنسخ المعتمدة وحالات القبول والرفض 💼
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span>عرض أسعار جديد</span>
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <ProposalsClient initialData={initialData} />
    </div>
  );
}
