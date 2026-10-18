import React from "react";
import { notFound } from "next/navigation";
import { getProposalById } from "@/lib/actions/proposals";
import { ClientDigitalProposal } from "@/components/proposals/client-digital-proposal";

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QuotePageProps) {
  const { id } = await params;
  const res = await getProposalById(id);
  if (!res.success || !res.data) {
    return { title: "عرض أسعار رقمي | Nile Nexus Solutions" };
  }
  return {
    title: `عرض أسعار رقمي - ${res.data.business_id} | نايل نيكسس`,
    description: `عرض أسعار مقدم إلى ${res.data.client?.name || "العميل"}`,
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const res = await getProposalById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ClientDigitalProposal proposal={res.data} />;
}
