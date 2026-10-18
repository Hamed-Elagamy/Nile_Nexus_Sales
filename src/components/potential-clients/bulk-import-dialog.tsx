"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";
import { toast } from "sonner";
import { createPotentialClient } from "@/lib/actions/potential-clients";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ParsedLead {
  name: string;
  company_name?: string;
  phone: string;
  email?: string;
  source: string;
  notes?: string;
  status: "valid" | "duplicate" | "invalid";
  reason?: string;
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setParsedLeads([]);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCSV(selected);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        // Split lines and normalize
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          toast.error("الملف لا يحتوي على صفوف بيانات صالحة");
          return;
        }

        // Detect delimiter: comma, semicolon, tab
        const firstLine = lines[0];
        const delimiter = firstLine.includes(";")
          ? ";"
          : firstLine.includes("\t")
          ? "\t"
          : ",";

        const headers = lines[0]
          .split(delimiter)
          .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

        // Find column indices
        const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("اسم") || h.includes("عميل"));
        const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("هاتف") || h.includes("موبايل") || h.includes("تليفون"));
        const companyIdx = headers.findIndex((h) => h.includes("company") || h.includes("شركة") || h.includes("مؤسسة"));
        const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("بريد") || h.includes("إيميل"));
        const notesIdx = headers.findIndex((h) => h.includes("note") || h.includes("ملاحظات") || h.includes("تفاصيل"));

        const seenPhones = new Set<string>();
        const leads: ParsedLead[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i]
            .split(delimiter)
            .map((c) => c.trim().replace(/^["']|["']$/g, ""));

          const name = (nameIdx >= 0 ? cols[nameIdx] : cols[0]) || "";
          const phone = (phoneIdx >= 0 ? cols[phoneIdx] : cols[1]) || "";
          const company = companyIdx >= 0 ? cols[companyIdx] : "";
          const email = emailIdx >= 0 ? cols[emailIdx] : "";
          const notes = notesIdx >= 0 ? cols[notesIdx] : "";

          // Validation
          const cleanPhone = phone.replace(/[^0-9+]/g, "");

          if (!name.trim() || !cleanPhone) {
            leads.push({
              name: name || "غير مسمى",
              company_name: company,
              phone: phone,
              email: email,
              source: "IMPORT",
              notes,
              status: "invalid",
              reason: "الاسم أو رقم الهاتف مفقود",
            });
            continue;
          }

          if (seenPhones.has(cleanPhone)) {
            leads.push({
              name,
              company_name: company,
              phone: cleanPhone,
              email,
              source: "IMPORT",
              notes,
              status: "duplicate",
              reason: "رقم هاتف مكرر داخل نفس الملف",
            });
            continue;
          }

          seenPhones.add(cleanPhone);
          leads.push({
            name,
            company_name: company,
            phone: cleanPhone,
            email,
            source: "IMPORT",
            notes,
            status: "valid",
          });
        }

        setParsedLeads(leads);
        sounds.click();
      } catch {
        toast.error("فشل تحليل ملف الـ CSV، تأكد من الصيغة");
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  const validCount = parsedLeads.filter((l) => l.status === "valid").length;
  const duplicateCount = parsedLeads.filter((l) => l.status === "duplicate").length;
  const invalidCount = parsedLeads.filter((l) => l.status === "invalid").length;

  const handleDownloadSample = () => {
    const csvContent = "\uFEFFالاسم,رقم الهاتف,الشركة,البريد الإلكتروني,ملاحظات\nأحمد علي,01012345678,شركة الأفق للتجارة,ahmed@alofok.com,مهتم بسيستم المخازن\nمحمود عادل,01198765432,مجموعة النيل,m.adel@nile.com,طلب عرض سعر مسبق";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "نموذج_استيراد_عملاء_محتملين.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.click();
  };

  const handleExecuteImport = async () => {
    const validLeads = parsedLeads.filter((l) => l.status === "valid");
    if (validLeads.length === 0) {
      toast.error("لا توجد سجلات صالحة للاستيراد");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const lead of validLeads) {
      try {
        const res = await createPotentialClient({
          name: lead.company_name ? `${lead.name} (${lead.company_name})` : lead.name,
          phone: lead.phone,
          notes: lead.notes || (lead.email ? `البريد الإلكتروني: ${lead.email}` : undefined),
        });

        if (res && res.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsImporting(false);
    if (successCount > 0) {
      sounds.success();
      toast.success(`تم استيراد ${successCount} عميل بنجاح! ${failCount > 0 ? `(فشل ${failCount})` : ""}`);
      onSuccess?.();
      onOpenChange(false);
      reset();
    } else {
      toast.error("تعذر استيراد السجلات، يرجى المحاولة لاحقاً");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">استيراد العملاء المحتملين دفعة واحدة (Bulk CSV Importer)</DialogTitle>
              <DialogDescription>
                ارفع شيت إكسيل بتنسيق CSV لإضافة مئات العملاء المحتملين فورياً مع كشف الأرقام المكررة.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Upload Dropzone */}
        {!file ? (
          <div className="mt-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/80 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-muted/30 flex flex-col items-center justify-center space-y-3"
            >
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">اضغط لاختيار ملف CSV أو اسحبه هنا</p>
                <p className="text-xs text-muted-foreground mt-1">
                  يدعم ملفات CSV بترميز UTF-8 مع عناوين الأعمدة (الاسم، الهاتف، الشركة، الإيميل)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>تحتاج إلى شيت قياسي جاهز؟</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={handleDownloadSample}
              >
                <Download className="h-3.5 w-3.5" />
                <span>تحميل نموذج إكسيل تجريبي</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{file.name}</span>
                <span className="text-[11px] text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={reset}
              >
                <X className="h-3.5 w-3.5 me-1" />
                <span>تغيير الملف</span>
              </Button>
            </div>

            {/* Validation Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-medium">سجلات صالحة</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {validCount}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-medium">أرقام مكررة</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                  {duplicateCount}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <span className="text-[10px] text-red-700 dark:text-red-300 block font-medium">سجلات غير مكتملة</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400 block mt-0.5">
                  {invalidCount}
                </span>
              </div>
            </div>

            {/* Leads Preview List */}
            <div className="border rounded-lg max-h-56 overflow-y-auto divide-y divide-border/60 text-xs">
              {parsedLeads.map((lead, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-muted/30">
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground block truncate">{lead.name}</span>
                    <span className="text-muted-foreground text-[11px] block">{lead.phone} {lead.company_name ? `• ${lead.company_name}` : ""}</span>
                  </div>

                  {lead.status === "valid" && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">
                      جاهز للاستيراد
                    </Badge>
                  )}
                  {lead.status === "duplicate" && (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400">
                      مكرر (تم الاستبعاد)
                    </Badge>
                  )}
                  {lead.status === "invalid" && (
                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400">
                      {lead.reason || "بيانات ناقصة"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={validCount === 0 || isImporting}
                onClick={handleExecuteImport}
                className="gap-2 font-semibold"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>جاري الاستيراد...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>تأكيد استيراد {validCount} عميل محتمل</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
