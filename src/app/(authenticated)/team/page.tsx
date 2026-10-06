import React from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTeamMembers } from "@/lib/actions/team";
import { TeamList } from "@/components/team/team-list";
import type { UserRole } from "@/lib/schemas/team";

export const metadata = {
  title: "فريق المبيعات | Nile Nexus Sales",
  description: "إدارة أعضاء فريق المبيعات وتوزيع الصلاحيات والأدوار",
};

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserRole: UserRole = "SALES";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    currentUserRole = (profile?.role || user.user_metadata?.role || "SALES") as UserRole;
  }

  const membersRes = await getTeamMembers();
  const members = membersRes.success && membersRes.data ? membersRes.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <span>فريق العمل (Team Members)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          إدارة مستخدمي النظام وتوزيع أدوار (GM / ADMIN / SALES) 👥
        </p>
      </div>

      {/* Team Members List */}
      <TeamList
        members={members}
        currentUserId={user?.id}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
