import { getPotentialClients } from "@/lib/actions/potential-clients";
import { PotentialClientsClient } from "@/components/potential-clients/potential-clients-client";

export const metadata = {
  title: "العملاء المحتملين | Nile Nexus Sales",
  description: "حوض البحث وتجميع الفرص التجارية",
};

export default async function PotentialClientsPage() {
  const initialRes = await getPotentialClients({ page: 1, pageSize: 20 });
  const initialData = initialRes.success ? initialRes.data : undefined;

  return <PotentialClientsClient initialData={initialData} />;
}
