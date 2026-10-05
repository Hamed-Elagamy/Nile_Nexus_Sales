import React from "react";
import { notFound } from "next/navigation";
import { getProposalById } from "@/lib/actions/proposals";
import { ProposalDetail } from "@/components/proposals/proposal-detail";

interface ProposalDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProposalDetailPageProps) {
  const { id } = await params;
  const res = await getProposalById(id);
  if (!res.success || !res.data) {
    return { title: "عرض السعر | Nile Nexus Sales" };
  }
  return {
    title: `${res.data.business_id} | عرض أسعار | Nile Nexus Sales`,
    description: `تفاصيل وبنود عرض السعر ${res.data.business_id}`,
  };
}

export default async function ProposalDetailPage({ params }: ProposalDetailPageProps) {
  const { id } = await params;
  const res = await getProposalById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ProposalDetail proposal={res.data} />;
}
