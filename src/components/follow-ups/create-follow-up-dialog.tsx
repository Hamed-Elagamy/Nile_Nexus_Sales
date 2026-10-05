"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFollowUp } from "@/lib/actions/follow-ups";

interface ClientOption {
  id: string;
  name: string;
  business_id: string;
}

interface CreateFollowUpDialogProps {
  clients?: ClientOption[];
  prefilledClientId?: string;
  prefilledDealId?: string;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateFollowUpDialog({
  clients = [],
  prefilledClientId,
  prefilledDealId,
  triggerButton,
  onSuccess,
}: CreateFollowUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState(prefilledClientId || "");
  const [action, setAction] = useState("CALL");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalClientId = prefilledClientId || clientId;

    if (!finalClientId) {
      toast.error("يرجى اختيار العميل");
      return;
    }

    if (!dueAt) {
      toast.error("يرجى تحديد موعد المتابعة");
      return;
    }

    startTransition(async () => {
      const res = await createFollowUp({
        client_id: finalClientId,
        deal_id: prefilledDealId || undefined,
        action,
        due_at: new Date(dueAt).toISOString(),
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success("تمت جدولة المتابعة بنجاح! 📅");
        setOpen(false);
        setDueAt("");
        setNotes("");
        onSuccess?.();
      } else {
        toast.error(res.error || "فشل إنشاء المتابعة");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          triggerButton ? (
            (triggerButton as React.ReactElement)
          ) : (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>جدولة متابعة</span>
            </Button>
          )
        }
      />

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarPlus className="h-5 w-5 text-primary" />
            <span>جدولة متابعة جديدة</span>
          </DialogTitle>
          <DialogDescription>
            حدد نوع الإجراء والموعد المستهدف للمتابعة بدقة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Client select if not prefilled */}
          {!prefilledClientId && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                العميل <span className="text-destructive">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="">اختر العميل...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.business_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">نوع الإجراء</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="CALL">اتصال هاتفي</option>
                <option value="MEETING">اجتماع / مقابلة</option>
                <option value="WHATSAPP">محادثة واتساب</option>
                <option value="EMAIL">إرسال إيميل</option>
                <option value="VISIT">زيارة ميدانية</option>
                <option value="OTHER">إجراء آخر</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                الموعد المحدد <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              ملاحظات / هدف المتابعة
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب الهدف من المتابعة أو النقاط الرئيسية المطلوبة..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "جارٍ الحفظ..." : "حفظ المتابعة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
