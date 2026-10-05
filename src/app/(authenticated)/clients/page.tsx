import { getClients } from "@/lib/actions/clients";
import { ClientsClient } from "@/components/clients/clients-client";

export const metadata = {
  title: "العملاء | Nile Nexus Sales",
  description: "دليل العملاء والشركات",
};

export default async function ClientsPage() {
  const initialRes = await getClients({ page: 1, pageSize: 20 });
  const initialData = initialRes.success ? initialRes.data : undefined;

  return <ClientsClient initialData={initialData} />;
}
