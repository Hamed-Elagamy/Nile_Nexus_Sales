import { notFound } from "next/navigation";
import { getClientById } from "@/lib/actions/clients";
import { ClientDetail } from "@/components/clients/client-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const res = await getClientById(id);
  if (!res.success || !res.data) {
    return { title: "ملف العميل | Nile Nexus Sales" };
  }
  return {
    title: `${res.data.name} (${res.data.business_id}) | Nile Nexus Sales`,
  };
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getClientById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ClientDetail client={res.data} />;
}
