import { notFound } from "next/navigation";
import { getDealById } from "@/lib/actions/deals";
import { DealDetail } from "@/components/deals/deal-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const res = await getDealById(id);
  if (!res.success || !res.data) {
    return { title: "تفاصيل الصفقة | Nile Nexus Sales" };
  }
  return {
    title: `${res.data.title} (${res.data.business_id}) | Nile Nexus Sales`,
  };
}

export default async function DealDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getDealById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <DealDetail deal={res.data} />;
}
