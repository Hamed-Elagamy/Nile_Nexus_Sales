"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      toast.error("يرجى ملء الاسم بالعربية والإنجليزية");
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
        toast.success("تمت إضافة الخدمة إلى الكتالوج بنجاح! 🏷️");
        setOpenDialog(false);
        setNameAr("");
        setNameEn("");
        setPrice("");
        router.refresh();
      } else {
        toast.error(res.error || "فشل إضافة الخدمة");
      }
    });
  };

  const handleToggleActive = (service: Service) => {
    startTransition(async () => {
      const res = await updateService(service.id, {
        is_active: !service.is_active,
      });

      if (res.success) {
        toast.success(`تم ${service.is_active ? "تعطيل" : "تفعيل"} الخدمة بنجاح`);
        router.refresh();
      } else {
        toast.error(res.error || "فشل تعديل الحالة");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">كتالوج الخدمات (Services)</h2>
          <p className="text-xs text-muted-foreground">
            الخدمات المعتمدة المعروضة في الصفقات وعروض الأسعار
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>إضافة خدمة</span>
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <span>إضافة خدمة جديدة إلى الكتالوج</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">اسم الخدمة (عربي) *</label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: تطوير متجر إلكتروني"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">اسم الخدمة (إنجليزي) *</label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. E-Commerce Development"
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">السعر المرجعي</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">العملة</label>
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
                  إلغاء
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "جارٍ الحفظ..." : "حفظ الخدمة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">اسم الخدمة</th>
              <th className="p-3">الاسم بالإنجليزية</th>
              <th className="p-3 text-left">السعر المرجعي</th>
              <th className="p-3 text-center">الحالة</th>
              <th className="p-3 text-center w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground">{s.name_ar}</td>
                <td className="p-3 text-muted-foreground font-mono">{s.name_en}</td>
                <td className="p-3 text-left font-mono font-semibold text-foreground">
                  {s.internal_reference_price
                    ? `${Number(s.internal_reference_price).toLocaleString()} ${s.currency}`
                    : "—"}
                </td>
                <td className="p-3 text-center">
                  {s.is_active ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      نشطة
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs">
                      معطلة
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
                    {s.is_active ? "تعطيل" : "تفعيل"}
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
