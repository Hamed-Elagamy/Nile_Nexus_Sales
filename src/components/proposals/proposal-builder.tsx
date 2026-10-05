"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calculator, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { ProposalItemInput } from "@/lib/schemas/proposal";

export interface ProposalBuilderState {
  items: ProposalItemInput[];
  currency: string;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  deliveryDuration: string;
  paymentTerms: string;
  termsAndConditions: string;
  validUntil: string;
  notes: string;
}

interface ProposalBuilderProps {
  initialState?: Partial<ProposalBuilderState>;
  onChange: (state: ProposalBuilderState) => void;
}

export function ProposalBuilder({ initialState, onChange }: ProposalBuilderProps) {
  const [items, setItems] = useState<ProposalItemInput[]>(
    initialState?.items && initialState.items.length > 0
      ? initialState.items
      : [
          {
            description_ar: "",
            quantity: 1,
            unit_price: 0,
            sort_order: 0,
          },
        ]
  );

  const [currency, setCurrency] = useState(initialState?.currency || "EGP");
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    initialState?.discountPercentage || 0
  );
  const [discountAmount, setDiscountAmount] = useState<number>(
    initialState?.discountAmount || 0
  );
  const [taxPercentage, setTaxPercentage] = useState<number>(
    initialState?.taxPercentage ?? 14
  );
  const [deliveryDuration, setDeliveryDuration] = useState(
    initialState?.deliveryDuration || "30 يوم عمل من تاريخ التوقيع وسداد الدفعة الأولى"
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialState?.paymentTerms || "50% دفعة أولى مقدمة، 50% عند التسليم النهائي والاعتماد"
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialState?.termsAndConditions ||
      "1. الأسعار سارية خلال مدة صلاحية العرض فقط.\n2. أي تعديلات جوهرية خارج نطاق العمل المتفق عليه تخضع لعرض أسعار إضافي.\n3. التسليم يخضع لتجاوب العميل في توفير المحتوى والموافقات."
  );
  const [validUntil, setValidUntil] = useState(initialState?.validUntil || "");
  const [notes, setNotes] = useState(initialState?.notes || "");

  const notifyChange = (updated: Partial<ProposalBuilderState>) => {
    onChange({
      items: updated.items ?? items,
      currency: updated.currency ?? currency,
      discountPercentage: updated.discountPercentage ?? discountPercentage,
      discountAmount: updated.discountAmount ?? discountAmount,
      taxPercentage: updated.taxPercentage ?? taxPercentage,
      deliveryDuration: updated.deliveryDuration ?? deliveryDuration,
      paymentTerms: updated.paymentTerms ?? paymentTerms,
      termsAndConditions: updated.termsAndConditions ?? termsAndConditions,
      validUntil: updated.validUntil ?? validUntil,
      notes: updated.notes ?? notes,
    });
  };

  const handleAddItem = () => {
    const newItems = [
      ...items,
      {
        description_ar: "",
        quantity: 1,
        unit_price: 0,
        sort_order: items.length,
      },
    ];
    setItems(newItems);
    notifyChange({ items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    notifyChange({ items: newItems });
  };

  const handleItemChange = (
    index: number,
    field: keyof ProposalItemInput,
    val: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: val,
    };
    setItems(newItems);
    notifyChange({ items: newItems });
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  );

  let discountVal = 0;
  if (discountPercentage > 0) {
    discountVal = (subtotal * discountPercentage) / 100;
  } else if (discountAmount > 0) {
    discountVal = discountAmount;
  }

  const taxableAmount = Math.max(0, subtotal - discountVal);
  const taxVal = (taxableAmount * (taxPercentage || 0)) / 100;
  const grandTotal = taxableAmount + taxVal;

  return (
    <div className="space-y-6">
      {/* Items Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span>بنود عرض السعر (Line Items)</span>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="text-xs h-8 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة بند جديد</span>
          </Button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 min-w-[240px]">وصف البند / الخدمة</th>
                  <th className="p-3 w-24 text-center">الكمية</th>
                  <th className="p-3 w-32 text-center">سعر الوحدة</th>
                  <th className="p-3 w-32 text-left">الإجمالي</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item, idx) => {
                  const lineTotal =
                    (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

                  return (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-3 text-center text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.description_ar}
                          onChange={(e) =>
                            handleItemChange(idx, "description_ar", e.target.value)
                          }
                          placeholder="اكتب وصف الخدمة أو البند بالتفصيل..."
                          required
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                          className="h-8 text-xs text-center font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "unit_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                          className="h-8 text-xs text-center font-mono"
                        />
                      </td>
                      <td className="p-3 text-left font-semibold font-mono text-foreground">
                        {lineTotal.toLocaleString()} {currency}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-muted-foreground hover:text-rose-600 disabled:opacity-30 transition-colors"
                          title="حذف البند"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Summary & Discounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Discounts & Tax Options */}
        <Card className="p-4 space-y-3 bg-card border-border">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-primary" />
            <span>الخصم والضرائب والعملة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">العملة</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  notifyChange({ currency: e.target.value });
                }}
                className="w-full h-8 rounded-md border border-input bg-card px-2.5 text-xs"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">
                ضريبة القيمة المضافة (VAT %)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={taxPercentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setTaxPercentage(val);
                  notifyChange({ taxPercentage: val });
                }}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">نسبة الخصم (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setDiscountPercentage(val);
                  setDiscountAmount(0);
                  notifyChange({ discountPercentage: val, discountAmount: 0 });
                }}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">صلاحية العرض حتى</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => {
                  setValidUntil(e.target.value);
                  notifyChange({ validUntil: e.target.value });
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Totals Summary */}
        <Card className="p-4 bg-muted/40 border-border space-y-2.5">
          <h4 className="text-xs font-semibold text-foreground">
            ملخص الحسابات المالية
          </h4>

          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
            <div className="flex items-center justify-between">
              <span>المجموع الفرعي (Subtotal):</span>
              <span className="font-mono font-medium text-foreground">
                {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
              </span>
            </div>

            {discountVal > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>قيمة الخصم:</span>
                <span className="font-mono font-medium">
                  - {discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            )}

            {taxVal > 0 && (
              <div className="flex items-center justify-between">
                <span>ضريبة القيمة المضافة ({taxPercentage}%):</span>
                <span className="font-mono font-medium text-foreground">
                  + {taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-bold text-foreground">
              <span>الإجمالي النهائي (Grand Total):</span>
              <span className="font-mono text-base text-primary">
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Commercial Terms & Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            مدة التوريد / التنفيذ
          </label>
          <Input
            value={deliveryDuration}
            onChange={(e) => {
              setDeliveryDuration(e.target.value);
              notifyChange({ deliveryDuration: e.target.value });
            }}
            placeholder="مثال: 30 يوم عمل"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">شروط الدفع</label>
          <Input
            value={paymentTerms}
            onChange={(e) => {
              setPaymentTerms(e.target.value);
              notifyChange({ paymentTerms: e.target.value });
            }}
            placeholder="مثال: 50% مقدم، 50% عند التسليم"
            className="h-9 text-xs"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            الشروط والأحكام العامة للعرض
          </label>
          <Textarea
            value={termsAndConditions}
            onChange={(e) => {
              setTermsAndConditions(e.target.value);
              notifyChange({ termsAndConditions: e.target.value });
            }}
            rows={3}
            className="text-xs resize-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            ملاحظات داخلية إضافية
          </label>
          <Input
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              notifyChange({ notes: e.target.value });
            }}
            placeholder="ملاحظات لفريق المبيعات (اختياري)..."
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
