"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TeamMemberCard } from "./team-member-card";
import type { TeamMemberWithStats } from "@/lib/actions/team";
import type { UserRole } from "@/lib/schemas/team";

interface TeamListProps {
  members: TeamMemberWithStats[];
  currentUserId?: string;
  currentUserRole?: UserRole;
}

export function TeamList({ members, currentUserId, currentUserRole }: TeamListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="pr-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "GM", "ADMIN", "SALES"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {r === "ALL" ? "الكل" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            لا يوجد أعضاء مطابقين للبحث
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <TeamMemberCard
              key={m.id}
              member={m}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onRefresh={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
