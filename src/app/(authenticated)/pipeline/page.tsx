import Link from "next/link";
import { Table as TableIcon } from "lucide-react";
import { getPipelineDeals, type PipelineStageSummary } from "@/lib/actions/deals";
import { type DealStage } from "@/lib/schemas/deal";
import { getClients } from "@/lib/actions/clients";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { CreateDealDialog } from "@/components/deals/create-deal-dialog";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "البايبلاين | Nile Nexus Sales",
  description: "لوحة كانبان لمتابعة مراحل الصفقات التجارية",
};

export default async function PipelinePage() {
  const t = await getTranslations("pipeline");
  const [pipelineRes, clientsRes] = await Promise.all([
    getPipelineDeals(),
    getClients({ page: 1, pageSize: 100 }),
  ]);

  const stages = pipelineRes.success && pipelineRes.data ? pipelineRes.data : ({} as Record<DealStage, PipelineStageSummary>);
  const clientsList = clientsRes.success && clientsRes.data
    ? clientsRes.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        business_id: c.business_id,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>{t("tableView")}</span>
          </Link>

          <CreateDealDialog clients={clientsList} />
        </div>
      </div>

      {/* Kanban Board */}
      <PipelineBoard initialStages={stages} />
    </div>
  );
}
