"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { completeFollowUp, type FollowUpWithRelations } from "@/lib/actions/follow-ups";

interface CompleteFollowUpDialogProps {
  followUp: FollowUpWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompleteFollowUpDialog({
  followUp,
  open,
  onOpenChange,
  onSuccess,
}: CompleteFollowUpDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [result, setResult] = useState("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextAction, setNextAction] = useState("CALL");
  const [nextDueAt, setNextDueAt] = useState("");
  const [nextNotes, setNextNotes] = useState("");

  if (!followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.trim()) {
      toast.error("يرجى كتابة نتيجة المتابعة أولاً");
      return;
    }

    if (scheduleNext && !nextDueAt) {
      toast.error("يرجى تحديد موعد المتابعة القادمة");
      return;
    }

    startTransition(async () => {
      const res = await completeFollowUp({
        follow_up_id: followUp.id,
        completion_result: result.trim(),
        schedule_next: scheduleNext,
        next_action: scheduleNext ? nextAction : undefined,
        next_due_at: scheduleNext && nextDueAt ? new Date(nextDueAt).toISOString() : undefined,
        next_notes: scheduleNext && nextNotes.trim() ? nextNotes.trim() : undefined,
      });

      if (res.success) {
        toast.success("تم تسجيل إتمام المتابعة بنجاح! 🎯");
        onOpenChange(false);
        setResult("");
        setScheduleNext(false);
        setNextDueAt("");
        setNextNotes("");
        onSuccess?.();
      } else {
        toast.error(res.error || "فشل إتمام المتابعة");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>تسجيل إتمام المتابعة</span>
          </DialogTitle>
          <DialogDescription>
            {followUp.client ? `العميل: ${followUp.client.name}` : "تفاصيل المتابعة"}
            {followUp.deal ? ` — الصفقة: ${followUp.deal.title}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Completion Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              ماذا تم في هذه المتابعة؟ <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="اكتب تفاصيل المكالمة أو ما دار في المقابلة وأي اتفاق تم مع العميل..."
              rows={3}
              required
              className="resize-none text-sm"
            />
          </div>

          {/* Schedule Next Checkbox */}
          <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm font-medium text-foreground">
                جدولة الخطوة القادمة فوراً 📅
              </span>
            </label>

            {scheduleNext && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">نوع الإجراء القادم</label>
                    <select
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="CALL">اتصال هاتف</option>
                      <option value="MEETING">اجتماع</option>
                      <option value="WHATSAPP">رسالة واتساب</option>
                      <option value="EMAIL">بريد إلكتروني</option>
                      <option value="VISIT">زيارة ميدانية</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      الموعد القادم <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={nextDueAt}
                      onChange={(e) => setNextDueAt(e.target.value)}
                      required={scheduleNext}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ملاحظات الخطوة القادمة</label>
                  <Input
                    value={nextNotes}
                    onChange={(e) => setNextNotes(e.target.value)}
                    placeholder="مثال: التأكيد على وصول العرض المالي ومناقشة الدفعة الأولى"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? "جارٍ الحفظ..." : "حفظ وإتمام"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
