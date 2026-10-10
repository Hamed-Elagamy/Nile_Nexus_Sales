"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Tag } from "lucide-react";
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
} from "@/lib/actions/settings";
import type { Service } from "@/types/domain";

interface ServicesCatalogProps {
  services: Service[];
}

export function ServicesCatalog({ services }: ServicesCatalogProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState(false);

  // Form State
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EGP");

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
        setOpenDialog(false);
        setNameAr("");
        setNameEn("");
        setPrice("");
        router.refresh();
      } else {
        toast.error(res.error || t("serviceAddFailed"));
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
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
                  onClick={() => setOpenDialog(false)}
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
              <th className="p-3 text-center w-20"></th>
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
                <td className="p-3 text-center">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleToggleActive(s)}
                    disabled={isPending}
                    className="h-7 text-xs"
                  >
                    {s.is_active ? t("deactivate") : t("activate")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
