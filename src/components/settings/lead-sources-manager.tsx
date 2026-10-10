"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Compass, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createLeadSource,
  updateLeadSource,
  deleteLeadSource,
} from "@/lib/actions/settings";
import type { LeadSource } from "@/types/domain";

interface LeadSourcesManagerProps {
  leadSources: LeadSource[];
  userRole?: string;
}

export function LeadSourcesManager({ leadSources, userRole = "SALES" }: LeadSourcesManagerProps) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const canManage = userRole === "GM" || userRole === "ADMIN";

  // Create Modal State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");

  // Edit Modal State
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  // Delete Modal State
  const [deletingSource, setDeletingSource] = useState<LeadSource | null>(null);

  const handleOpenEdit = (ls: LeadSource) => {
    setEditingSource(ls);
    setEditNameAr(ls.name_ar);
    setEditNameEn(ls.name_en);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await createLeadSource({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
      });

      if (res.success) {
        toast.success(t("leadSourceAdded"));
        setOpenCreateDialog(false);
        setNameAr("");
        setNameEn("");
        router.refresh();
      } else {
        toast.error(res.error || t("leadSourceFailed"));
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    if (!editNameAr || !editNameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await updateLeadSource(editingSource.id, {
        name_ar: editNameAr.trim(),
        name_en: editNameEn.trim(),
      });

      if (res.success) {
        toast.success(t("leadSourceUpdated"));
        setEditingSource(null);
        router.refresh();
      } else {
        toast.error(res.error || t("leadSourceUpdateFailed"));
      }
    });
  };

  const handleDelete = () => {
    if (!deletingSource) return;

    startTransition(async () => {
      const res = await deleteLeadSource(deletingSource.id);

      if (res.success) {
        if (res.warning === "sourceInUseArchived") {
          toast.warning(t("sourceInUseArchived"));
        } else {
          toast.success(t("leadSourceDeleted"));
        }
        setDeletingSource(null);
        router.refresh();
      } else {
        toast.error(res.error || t("leadSourceDeleteFailed"));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">{t("leadSourcesTitle")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("leadSourcesDesc")}
          </p>
        </div>

        {canManage && (
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  <span>{t("addLeadSource")}</span>
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <span>{t("addLeadSourceTitle")}</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("sourceNameAr")}</label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t("sourceNameArPlaceholder")}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("sourceNameEn")}</label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t("sourceNameEnPlaceholder")}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenCreateDialog(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? t("saving") : t("addLeadSource")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {leadSources.map((ls) => (
          <div
            key={ls.id}
            className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-2 group hover:border-border/80 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">{ls.name_ar}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">{ls.name_en}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={
                  ls.is_active !== false
                    ? "text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "text-[10px] bg-muted text-muted-foreground border-border"
                }
              >
                {ls.is_active !== false ? t("sourceAvailable") : t("inactive")}
              </Badge>

              {canManage && (
                <div className="flex items-center gap-1 ms-1">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => handleOpenEdit(ls)}
                    disabled={isPending}
                    className="h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer"
                    title={t("editLeadSource")}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setDeletingSource(ls)}
                    disabled={isPending}
                    className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    title={t("deleteLeadSource")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Lead Source Modal */}
      {editingSource && (
        <Dialog open={!!editingSource} onOpenChange={(open) => !open && setEditingSource(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                <span>{t("editLeadSourceTitle")}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("sourceNameAr")}</label>
                <Input
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder={t("sourceNameArPlaceholder")}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("sourceNameEn")}</label>
                <Input
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder={t("sourceNameEnPlaceholder")}
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSource(null)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? t("saving") : tCommon("save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSource && (
        <Dialog open={!!deletingSource} onOpenChange={(open) => !open && setDeletingSource(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("deleteLeadSource")}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs text-muted-foreground">
              <p>{t("confirmDeleteLeadSource")}</p>
              <div className="p-3 rounded-lg border border-border bg-muted/30 font-medium text-foreground">
                <p className="font-bold">{deletingSource.name_ar}</p>
                <p className="font-mono text-muted-foreground text-[11px]">{deletingSource.name_en}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingSource(null)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? t("saving") : t("deleteLeadSource")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
