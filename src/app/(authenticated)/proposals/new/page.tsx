import React from "react";
import { getClients } from "@/lib/actions/clients";
import { getDeals } from "@/lib/actions/deals";
import { CreateProposalWizard } from "@/components/proposals/create-proposal-wizard";

export const metadata = {
  title: "إنشاء عرض أسعار جديد | Nile Nexus Sales",
  description: "إنشاء عرض أسعار تجاري جديد وتحديد البنود والشروط المالية",
};

export default async function NewProposalPage() {
  const [clientsRes, dealsRes] = await Promise.all([
    getClients({ page: 1, pageSize: 100 }),
    getDeals({ page: 1, pageSize: 100 }),
  ]);

  const clients = clientsRes.success && clientsRes.data
    ? clientsRes.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        business_id: c.business_id,
      }))
    : [];

  const deals = dealsRes.success && dealsRes.data
    ? dealsRes.data.items.map((d) => ({
        id: d.id,
        title: d.title,
        client_id: d.client_id,
        business_id: d.business_id,
      }))
    : [];

  return <CreateProposalWizard clients={clients} deals={deals} />;
}
