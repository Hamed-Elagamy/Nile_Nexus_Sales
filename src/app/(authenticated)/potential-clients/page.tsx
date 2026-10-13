import { getPotentialClients } from "@/lib/actions/potential-clients";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { PotentialClientsClient } from "@/components/potential-clients/potential-clients-client";

export const metadata = {
  title: "العملاء المحتملين | Nile Nexus Sales",
  description: "حوض البحث وتجميع الفرص التجارية",
};

export default async function PotentialClientsPage() {
  const [initialRes, profileRes] = await Promise.all([
    getPotentialClients({ page: 1, pageSize: 20 }),
    getCurrentUserProfile(),
  ]);

  const initialData = initialRes.success ? initialRes.data : undefined;
  const userRole = profileRes.success && profileRes.data ? profileRes.data.role : "SALES";

  return <PotentialClientsClient initialData={initialData} userRole={userRole} />;
}

