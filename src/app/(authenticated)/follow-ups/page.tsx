import React from "react";
import { getFollowUps } from "@/lib/actions/follow-ups";
import { getClients } from "@/lib/actions/clients";
import { FollowUpsClient } from "@/components/follow-ups/follow-ups-client";
import { CreateFollowUpDialog } from "@/components/follow-ups/create-follow-up-dialog";

export const metadata = {
  title: "المتابعات اليومية | Nile Nexus Sales",
  description: "جدول المتابعات والاتصالات والاجتماعات اليومية لفريق المبيعات",
};

export default async function FollowUpsPage() {
  const [followUpsRes, clientsRes] = await Promise.all([
    getFollowUps({ tab: "TODAY", page: 1, pageSize: 20 }),
    getClients({ page: 1, pageSize: 100 }),
  ]);

  const initialData = followUpsRes.success && followUpsRes.data ? followUpsRes.data : undefined;
  const clientsList = clientsRes.success && clientsRes.data
    ? clientsRes.data.items.map((c) => ({
        id: c.id,
        name: c.name,
        business_id: c.business_id,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            المتابعات اليومية (Follow-ups)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            خطة العمل اليومية للمكالمات والاجتماعات ومتابعة العملاء خطوة بخطوة 📞
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateFollowUpDialog clients={clientsList} />
        </div>
      </div>

      {/* Main Interactive Container */}
      <FollowUpsClient initialData={initialData} clients={clientsList} />
    </div>
  );
}
