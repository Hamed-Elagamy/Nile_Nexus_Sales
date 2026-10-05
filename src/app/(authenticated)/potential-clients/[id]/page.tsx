import { notFound } from "next/navigation";
import { getPotentialClientById } from "@/lib/actions/potential-clients";
import { PotentialClientDetail } from "@/components/potential-clients/potential-client-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const res = await getPotentialClientById(id);
  if (!res.success || !res.data) {
    return { title: "العميل المحتمل | Nile Nexus Sales" };
  }
  return {
    title: `${res.data.name} (${res.data.business_id}) | Nile Nexus Sales`,
  };
}

export default async function PotentialClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getPotentialClientById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <PotentialClientDetail client={res.data} />;
}
