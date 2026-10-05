"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Compass } from "lucide-react";
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
import { createLeadSource } from "@/lib/actions/settings";
import type { LeadSource } from "@/types/domain";

interface LeadSourcesManagerProps {
  leadSources: LeadSource[];
}

export function LeadSourcesManager({ leadSources }: LeadSourcesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState(false);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) {
      toast.error("يرجى ملء الاسم بالعربية والإنجليزية");
      return;
    }

    startTransition(async () => {
      const res = await createLeadSource({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
      });

      if (res.success) {
        toast.success("تمت إضافة مصدر العملاء بنجاح! 🧭");
        setOpenDialog(false);
        setNameAr("");
        setNameEn("");
        router.refresh();
      } else {
        toast.error(res.error || "فشل إضافة المصدر");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">مصادر العملاء (Lead Sources)</h2>
          <p className="text-xs text-muted-foreground">
            القنوات التسويقية والتوصيات التي تأتي من خلالها الصفقات والعملاء
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>إضافة مصدر</span>
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <span>إضافة مصدر عملاء جديد</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">اسم المصدر (عربي) *</label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: إعلانات تيك توك"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">اسم المصدر (إنجليزي) *</label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. TikTok Ads"
                  required
                  className="h-9 text-xs font-mono"
                />
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
                  {isPending ? "جارٍ الحفظ..." : "حفظ المصدر"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {leadSources.map((ls) => (
          <div
            key={ls.id}
            className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-foreground">{ls.name_ar}</p>
              <p className="text-xs text-muted-foreground font-mono">{ls.name_en}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              مصدر متاح
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
