"use client";

import React, { useState, useEffect } from "react";
import { FileEdit, Copy, Trash2, Check, Clock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sounds } from "@/lib/utils/confetti-sound";

interface FloatingScratchpadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = "nile_sales_scratchpad";

export function FloatingScratchpad({ open, onOpenChange }: FloatingScratchpadProps) {
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) || "";
      setContent(saved);
    }
  }, []);

  const handleChange = (val: string) => {
    setContent(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, val);
    }
  };

  const handleInsertTimestamp = () => {
    sounds.playTactileClick();
    const now = new Date();
    const stamp = `\n--- [${now.toLocaleDateString("ar-EG")} ${now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}] ---\n`;
    handleChange(content + stamp);
  };

  const handleCopy = () => {
    sounds.playTactileClick();
    if (!content.trim()) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("تم نسخ الملاحظات للحافظة بنجاح!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!content.trim()) return;
    if (confirm("هل أنت متأكد من رغبتك في مسح المفكرة؟")) {
      sounds.playTactileClick();
      handleChange("");
      toast.info("تم مسح المفكرة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <FileEdit className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-foreground">
                المفكرة السريعة (Sales Scratchpad)
              </DialogTitle>
            </div>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              حفظ تلقائي محلي
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Quick Toolbar */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={handleInsertTimestamp}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer text-[11px]"
              title="إدراج الوقت والتاريخ"
            >
              <Clock className="h-3 w-3 text-primary" />
              <span>إدراج توقيت</span>
            </button>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{content.length} حرف</span>
              <span>•</span>
              <span>{content.trim() ? content.trim().split(/\s+/).length : 0} كلمة</span>
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            rows={8}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="اكتب هنا أي أرقام، ملاحظات اتصال سريعة، أو أفكار طارئة أثناء المكالمة..."
            className="w-full text-xs sm:text-sm font-sans leading-relaxed resize-y bg-background"
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!content.trim()}
              className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>مسح</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                إغلاق
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                disabled={!content.trim()}
                className="text-xs gap-1.5 bg-primary text-white cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "تم النسخ!" : "نسخ الملاحظات"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
