"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, Phone, ShieldCheck, UserCheck, UserX, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateMemberRole,
  toggleMemberStatus,
  deleteTeamMember,
  type TeamMemberWithStats,
} from "@/lib/actions/team";
import type { UserRole } from "@/lib/schemas/team";

interface TeamMemberCardProps {
  member: TeamMemberWithStats;
  currentUserId?: string;
  currentUserRole?: UserRole;
  onRefresh?: () => void;
}

export function TeamMemberCard({
  member,
  currentUserId,
  currentUserRole,
  onRefresh,
}: TeamMemberCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    startTransition(async () => {
      const res = await updateMemberRole({
        user_id: member.id,
        role: newRole,
      });

      if (res.success) {
        toast.success(`تم تغيير دور ${member.full_name} إلى ${newRole} بنجاح`);
        onRefresh?.();
      } else {
        toast.error(res.error || "فشل تعديل الدور");
      }
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      const res = await toggleMemberStatus({
        user_id: member.id,
        is_active: !member.is_active,
      });

      if (res.success) {
        toast.success(`تم ${member.is_active ? "تعطيل" : "تفعيل"} الحساب بنجاح`);
        onRefresh?.();
      } else {
        toast.error(res.error || "فشل تحديث الحالة");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTeamMember({ user_id: member.id });

      if (res.success) {
        toast.success(res.warning || `تم حذف حساب ${member.full_name} بنجاح`);
        setShowDeleteConfirm(false);
        onRefresh?.();
      } else {
        toast.error(res.error || "فشل حذف المستخدم");
      }
    });
  };

  const roleBadge = () => {
    switch (member.role) {
      case "GM":
        return (
          <Badge className="bg-purple-600 text-white hover:bg-purple-700 text-xs gap-1 font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>المدير العام (GM)</span>
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-blue-600 text-white hover:bg-blue-700 text-xs gap-1 font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>مدير النظام (ADMIN)</span>
          </Badge>
        );
      case "SALES":
      default:
        return (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs gap-1 font-bold">
            <UserCheck className="h-3 w-3" />
            <span>مسؤول مبيعات (SALES)</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 bg-card border-border shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <div className="h-10 w-10 rounded-full overflow-hidden border border-border shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
              {member.full_name ? member.full_name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {member.full_name || "عضو فريق"}
              </h3>
              {member.is_active ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="نشط" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-rose-500" title="معطل" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Mail className="h-3 w-3" />
              <span>{member.email}</span>
            </div>
          </div>
        </div>

        <div>{roleBadge()}</div>
      </div>

      {member.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <Phone className="h-3 w-3" />
          <span className="font-mono">{member.phone}</span>
        </div>
      )}

      {/* Inline Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
          <p className="font-semibold text-rose-700 dark:text-rose-300">
            هل أنت متأكد من حذف حساب {member.full_name || member.email} نهائياً؟
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              size="xs"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      )}

      {/* Role and Status Actions */}
      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">تعديل الدور:</span>
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            disabled={isPending}
            className="h-7 text-[11px] rounded border border-input bg-card px-2"
          >
            <option value="SALES">SALES</option>
            <option value="ADMIN">ADMIN</option>
            <option value="GM">GM</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {/* GM User Delete Action */}
          {currentUserRole === "GM" && member.id !== currentUserId && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending || showDeleteConfirm}
              className="text-[11px] h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1 cursor-pointer"
              title="حذف المستخدم"
            >
              <Trash2 className="h-3 w-3" />
              <span>حذف</span>
            </Button>
          )}

          {/* Toggle Active / Deactivate */}
          <Button
            size="xs"
            variant="outline"
            onClick={handleToggleActive}
            disabled={isPending || member.id === currentUserId}
            className={`text-[11px] h-7 gap-1 cursor-pointer ${
              member.is_active
                ? "text-rose-600 hover:bg-rose-500/10"
                : "text-emerald-600 hover:bg-emerald-500/10"
            }`}
          >
            {member.is_active ? (
              <>
                <UserX className="h-3 w-3" />
                <span>تعطيل</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3" />
                <span>تفعيل</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
