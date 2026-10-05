"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProposalWithRelations, ProposalVersionWithItems } from "@/lib/actions/proposals";

interface ProposalPrintViewProps {
  proposal: ProposalWithRelations;
  version: ProposalVersionWithItems;
  onClose?: () => void;
}

export function ProposalPrintView({ proposal, version, onClose }: ProposalPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(version.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedValidUntil = version.valid_until
    ? new Date(version.valid_until).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "30 يوماً من تاريخ الإصدار";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:static print:bg-white print:text-black">
      <div className="w-full max-w-4xl bg-card border border-border shadow-2xl rounded-xl p-8 sm:p-12 space-y-8 relative print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white print:text-black">
        {/* Floating Actions (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-primary text-primary-foreground">
              <Printer className="h-4 w-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </Button>
          </div>

          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="text-muted-foreground">
              <X className="h-4 w-4" />
              <span>إغلاق المعاينة</span>
            </Button>
          )}
        </div>

        {/* Quotation Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black tracking-tight text-primary">
                Nile Nexus
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                Sales & Tech Solutions
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              شركة نايل نيكسس للحلول الرقمية وتطوير الأعمال
              <br />
              القاهرة، جمهورية مصر العربية
              <br />
              contact@nilenexus.com | +20 100 000 0000
            </p>
          </div>

          <div className="sm:text-left text-right space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              عرض أسعار تجاري (Quotation)
            </h2>
            <p className="text-xs font-mono font-semibold text-primary">
              رقم العرض: {proposal.business_id} — v{version.version_number}
            </p>
            <p className="text-xs text-muted-foreground">
              تاريخ الإصدار: {formattedDate}
            </p>
            <p className="text-xs text-muted-foreground">
              ساري حتى: {formattedValidUntil}
            </p>
          </div>
        </div>

        {/* Client & Deal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-lg bg-muted/40 border border-border/60 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
              مُوجّه إلى السيد / السادة:
            </span>
            <p className="font-bold text-sm text-foreground">
              {proposal.client?.name || "العميل الكريم"}
            </p>
            {proposal.client?.phone && (
              <p className="text-muted-foreground font-mono">هاتف: {proposal.client.phone}</p>
            )}
            {proposal.client?.email && (
              <p className="text-muted-foreground">بريد: {proposal.client.email}</p>
            )}
          </div>

          <div className="space-y-1 sm:text-left text-right">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
              تفاصيل المشروع:
            </span>
            <p className="font-bold text-sm text-foreground">
              {proposal.deal?.title || "عرض خدمات استشارية وتطويرية"}
            </p>
            {proposal.deal?.business_id && (
              <p className="text-muted-foreground font-mono">
                كود الصفقة: {proposal.deal.business_id}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border border-border/80">
              <thead className="bg-muted/80 text-foreground font-semibold border-b border-border/80">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">بيان البند والخدمات المقدمة</th>
                  <th className="p-3 w-20 text-center">الكمية</th>
                  <th className="p-3 w-32 text-center">سعر الوحدة</th>
                  <th className="p-3 w-32 text-left">الإجمالي ({version.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {version.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="p-3 text-center text-muted-foreground font-mono">{idx + 1}</td>
                    <td className="p-3 font-medium text-foreground leading-relaxed">
                      {item.description_ar}
                      {item.description_en && (
                        <span className="block text-[11px] text-muted-foreground font-normal">
                          {item.description_en}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                    <td className="p-3 text-center font-mono">
                      {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-left font-mono font-semibold">
                      {Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-80 space-y-2 text-xs border border-border/80 rounded-lg p-4 bg-muted/20">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع الفرعي (Subtotal):</span>
              <span className="font-mono font-medium text-foreground">
                {Number(version.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} {version.currency}
              </span>
            </div>

            {Number(version.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>الخصم الممنوح:</span>
                <span className="font-mono">
                  - {Number(version.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {version.currency}
                </span>
              </div>
            )}

            {Number(version.tax_amount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>ضريبة القيمة المضافة (VAT):</span>
                <span className="font-mono font-medium text-foreground">
                  + {Number(version.tax_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {version.currency}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
              <span>الإجمالي المستحق (Total):</span>
              <span className="font-mono text-base text-primary">
                {Number(version.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })} {version.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Commercial Terms & Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/80 text-xs">
          {version.delivery_duration && (
            <div className="space-y-1">
              <span className="font-bold text-foreground">مدة التوريد والتنفيذ:</span>
              <p className="text-muted-foreground leading-relaxed">{version.delivery_duration}</p>
            </div>
          )}

          {version.payment_terms && (
            <div className="space-y-1">
              <span className="font-bold text-foreground">شروط وطريقة الدفع:</span>
              <p className="text-muted-foreground leading-relaxed">{version.payment_terms}</p>
            </div>
          )}

          {version.terms_and_conditions && (
            <div className="sm:col-span-2 space-y-1 pt-2">
              <span className="font-bold text-foreground">الشروط العامة والتعاقدية:</span>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {version.terms_and_conditions}
              </p>
            </div>
          )}
        </div>

        {/* Signatures & Acceptance Block */}
        <div className="pt-8 border-t border-border/80 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-12">
            <span className="font-bold text-foreground block">
              عن شركة نايل نيكسس (مُعدّ العرض)
            </span>
            <div className="border-b border-border/80 w-48 mx-auto" />
            <span className="text-[11px] text-muted-foreground block">
              التوقيع والختم الرسمي
            </span>
          </div>

          <div className="space-y-12">
            <span className="font-bold text-foreground block">
              موافقة واعتماد العميل (المفوض بالتوقيع)
            </span>
            <div className="border-b border-border/80 w-48 mx-auto" />
            <span className="text-[11px] text-muted-foreground block">
              الاسم / التوقيع / التاريخ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
