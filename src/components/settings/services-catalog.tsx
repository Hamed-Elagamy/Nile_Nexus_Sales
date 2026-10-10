"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Tag, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/settings";
import type { Service } from "@/types/domain";

interface ServicesCatalogProps {
  services: Service[];
  userRole?: string;
}

export function ServicesCatalog({ services, userRole = "SALES" }: ServicesCatalogProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canManage = userRole === "GM" || userRole === "ADMIN";

  // Create Modal State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EGP");

  // Edit Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("EGP");

  // Delete Modal State
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setEditNameAr(service.name_ar);
    setEditNameEn(service.name_en);
    setEditPrice(service.internal_reference_price ? String(service.internal_reference_price) : "");
    setEditCurrency(service.currency || "EGP");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await createService({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        internal_reference_price: price ? parseFloat(price) : undefined,
        currency,
        sort_order: services.length,
      });

      if (res.success) {
        toast.success(t("serviceAdded"));
        setOpenCreateDialog(false);
        setNameAr("");
        setNameEn("");
        setPrice("");
        router.refresh();
      } else {
        toast.error(res.error || t("serviceAddFailed"));
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editNameAr || !editNameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await updateService(editingService.id, {
        name_ar: editNameAr.trim(),
        name_en: editNameEn.trim(),
        internal_reference_price: editPrice ? parseFloat(editPrice) : null,
        currency: editCurrency,
      });

      if (res.success) {
        toast.success(t("serviceUpdated"));
        setEditingService(null);
        router.refresh();
      } else {
        toast.error(res.error || t("serviceUpdateFailed"));
      }
    });
  };

  const handleDelete = () => {
    if (!deletingService) return;

    startTransition(async () => {
      const res = await deleteService(deletingService.id);

      if (res.success) {
        if (res.warning === "serviceInUseArchived") {
          toast.warning(t("serviceInUseArchived"));
        } else {
          toast.success(t("serviceDeleted"));
        }
        setDeletingService(null);
        router.refresh();
      } else {
        toast.error(res.error || t("serviceDeleteFailed"));
      }
    });
  };

  const handleToggleActive = (service: Service) => {
    startTransition(async () => {
      const res = await updateService(service.id, {
        is_active: !service.is_active,
      });

      if (res.success) {
        toast.success(t("serviceStatusUpdated"));
        router.refresh();
      } else {
        toast.error(res.error || t("serviceStatusFailed"));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">{t("servicesCatalogTitle")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("servicesCatalogDesc")}
          </p>
        </div>

        {canManage && (
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  <span>{t("addService")}</span>
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span>{t("addServiceTitle")}</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("serviceNameAr")}</label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t("serviceNameArPlaceholder")}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("serviceNameEn")}</label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t("serviceNameEnPlaceholder")}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">{t("referencePrice")}</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t("referencePricePlaceholder")}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">{t("currency")}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
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
                    {isPending ? t("saving") : tCommon("save")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-start text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3 text-start">{t("serviceColName")}</th>
              <th className="p-3 text-start">{t("serviceColNameEn")}</th>
              <th className="p-3 text-start">{t("serviceColPrice")}</th>
              <th className="p-3 text-center">{t("serviceColStatus")}</th>
              {canManage && <th className="p-3 text-end">{tCommon("actions")}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground">{s.name_ar}</td>
                <td className="p-3 text-muted-foreground font-mono">{s.name_en}</td>
                <td className="p-3 text-start font-mono font-semibold text-foreground">
                  {s.internal_reference_price
                    ? `${Number(s.internal_reference_price).toLocaleString()} ${s.currency}`
                    : "—"}
                </td>
                <td className="p-3 text-center">
                  {s.is_active ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      {t("active")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs">
                      {t("inactive")}
                    </Badge>
                  )}
                </td>
                {canManage && (
                  <td className="p-3 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleOpenEdit(s)}
                        disabled={isPending}
                        className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                        title={t("editService")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{tCommon("edit")}</span>
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleToggleActive(s)}
                        disabled={isPending}
                        className="h-7 px-2 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                      >
                        {s.is_active ? t("deactivate") : t("activate")}
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setDeletingService(s)}
                        disabled={isPending}
                        className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 cursor-pointer"
                        title={t("deleteService")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                <span>{t("editServiceTitle")}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("serviceNameAr")}</label>
                <Input
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder={t("serviceNameArPlaceholder")}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("serviceNameEn")}</label>
                <Input
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder={t("serviceNameEnPlaceholder")}
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("referencePrice")}</label>
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder={t("referencePricePlaceholder")}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("currency")}</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
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
      {deletingService && (
        <Dialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("deleteService")}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs text-muted-foreground">
              <p>{t("confirmDeleteService")}</p>
              <div className="p-3 rounded-lg border border-border bg-muted/30 font-medium text-foreground">
                <p className="font-bold">{deletingService.name_ar}</p>
                <p className="font-mono text-muted-foreground text-[11px]">{deletingService.name_en}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingService(null)}
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
                {isPending ? t("saving") : t("deleteService")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
