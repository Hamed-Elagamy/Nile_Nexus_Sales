import { getDeals } from "@/lib/actions/deals";
import { getClients } from "@/lib/actions/clients";
import { DealsClient } from "@/components/deals/deals-client";

export const metadata = {
  title: "الصفقات | Nile Nexus Sales",
  description: "إدارة الصفقات التجارية",
};

export default async function DealsPage() {
  const [dealsRes, clientsRes] = await Promise.all([
    getDeals({ page: 1, pageSize: 20 }),
    getClients({ page: 1, pageSize: 100 }),
  ]);

  const initialData = dealsRes.success ? dealsRes.data : undefined;
  const clientsList = clientsRes.success && clientsRes.data
    ? clientsRes.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        business_id: c.business_id,
      }))
    : [];

  return <DealsClient initialData={initialData} clients={clientsList} />;
}
