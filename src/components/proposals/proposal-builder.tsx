"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Calculator, Coins, Tag, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProposalItemInput } from "@/lib/schemas/proposal";
import type { Service } from "@/types/domain";

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
  services?: Service[];
}

export function ProposalBuilder({ initialState, onChange, services = [] }: ProposalBuilderProps) {
  const t = useTranslations("proposals");

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
    initialState?.deliveryDuration || t("defaultDelivery")
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialState?.paymentTerms || t("defaultPaymentTerms")
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialState?.termsAndConditions || t("defaultTermsConditions")
  );
  const [validUntil, setValidUntil] = useState(initialState?.validUntil || "");
  const [notes, setNotes] = useState(initialState?.notes || "");

  // Service Catalog Picker State
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const filteredCatalogServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    const query = catalogSearch.trim().toLowerCase();
    return services.filter((s) => {
      if (!s.is_active) return false;
      if (!query) return true;
      return (
        s.name_ar.toLowerCase().includes(query) ||
        (s.name_en && s.name_en.toLowerCase().includes(query)) ||
        (s.internal_reference_price && String(s.internal_reference_price).includes(query))
      );
    });
  }, [services, catalogSearch]);

  const handleSelectService = (service: Service) => {
    const unitPrice = Number(service.internal_reference_price) || 0;
    let newItems: ProposalItemInput[];

    if (items.length === 1 && !items[0].description_ar.trim() && (items[0].unit_price === 0 || !items[0].unit_price)) {
      newItems = [
        {
          description_ar: service.name_ar,
          quantity: 1,
          unit_price: unitPrice,
          sort_order: 0,
        },
      ];
    } else {
      newItems = [
        ...items,
        {
          description_ar: service.name_ar,
          quantity: 1,
          unit_price: unitPrice,
          sort_order: items.length,
        },
      ];
    }

    setItems(newItems);
    notifyChange({ items: newItems });
    toast.success(t("serviceAddedToProposal", { name: service.name_ar }));
    setCatalogOpen(false);
  };

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
            <span>{t("lineItemsTitle")}</span>
          </h3>
          <div className="flex items-center gap-2">
            {services && services.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCatalogOpen(true)}
                className="text-xs h-8 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-medium"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>{t("addFromCatalog")}</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs h-8 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("addItem")}</span>
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-3 w-10 text-center">{t("tableNumber")}</th>
                  <th className="p-3 min-w-[240px]">{t("tableDescription")}</th>
                  <th className="p-3 w-24 text-center">{t("tableQuantity")}</th>
                  <th className="p-3 w-32 text-center">{t("tableUnitPrice")}</th>
                  <th className="p-3 w-32 text-left rtl:text-left ltr:text-right">{t("tableTotal")}</th>
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
                          placeholder={t("itemDescriptionPlaceholder")}
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
                      <td className="p-3 text-left rtl:text-left ltr:text-right font-semibold font-mono text-foreground">
                        {lineTotal.toLocaleString()} {currency}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-muted-foreground hover:text-rose-600 disabled:opacity-30 transition-colors"
                          title={t("deleteItem")}
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
            <span>{t("financialSummary")}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">{t("currencyLabel")}</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  notifyChange({ currency: e.target.value });
                }}
                className="w-full h-8 rounded-md border border-input bg-card px-2.5 text-xs"
              >
                <option value="EGP">{t("currencies.EGP")}</option>
                <option value="USD">{t("currencies.USD")}</option>
                <option value="SAR">{t("currencies.SAR")}</option>
                <option value="AED">{t("currencies.AED")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">
                {t("vatLabel")}
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
              <label className="text-[11px] text-muted-foreground">{t("discountPercentageLabel")}</label>
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
              <label className="text-[11px] text-muted-foreground">{t("validUntilLabel")}</label>
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
            {t("financialSummaryTitle")}
          </h4>

          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
            <div className="flex items-center justify-between">
              <span>{t("subtotal")}:</span>
              <span className="font-mono font-medium text-foreground">
                {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
              </span>
            </div>

            {discountVal > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t("discountTotal")}:</span>
                <span className="font-mono font-medium">
                  - {discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            )}

            {taxVal > 0 && (
              <div className="flex items-center justify-between">
                <span>{t("vatTax", { percentage: taxPercentage })}</span>
                <span className="font-mono font-medium text-foreground">
                  + {taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-bold text-foreground">
              <span>{t("grandTotal")}:</span>
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
            {t("deliveryDurationLabel")}
          </label>
          <Input
            value={deliveryDuration}
            onChange={(e) => {
              setDeliveryDuration(e.target.value);
              notifyChange({ deliveryDuration: e.target.value });
            }}
            placeholder={t("deliveryPlaceholder")}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">{t("paymentTermsLabel")}</label>
          <Input
            value={paymentTerms}
            onChange={(e) => {
              setPaymentTerms(e.target.value);
              notifyChange({ paymentTerms: e.target.value });
            }}
            placeholder={t("paymentPlaceholder")}
            className="h-9 text-xs"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            {t("termsConditionsLabel")}
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
            {t("notesLabel")}
          </label>
          <Input
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              notifyChange({ notes: e.target.value });
            }}
            placeholder={t("internalNotesPlaceholder")}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Service Catalog Picker Dialog */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-5">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>{t("catalogModalTitle")}</span>
              </DialogTitle>
              <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-0.5 rounded-full">
                {t("serviceCatalogCount", { count: filteredCatalogServices.length })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t("catalogModalDesc")}
            </p>
          </DialogHeader>

          {/* Search Box */}
          <div className="relative my-3">
            <Search className="absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder={t("searchServicesPlaceholder")}
              className="pr-9 rtl:pr-9 ltr:pl-9 text-xs h-9 bg-card"
              autoFocus
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch("")}
                className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Services List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh] divide-y divide-border/30">
            {filteredCatalogServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                {t("noServicesFound")}
              </div>
            ) : (
              filteredCatalogServices.map((service) => (
                <div
                  key={service.id}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 hover:border-primary/50 bg-card hover:bg-muted/30 transition-all text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-semibold">
                        #{service.sort_order}
                      </span>
                      <h4 className="font-semibold text-foreground truncate">
                        {service.name_ar}
                      </h4>
                    </div>
                    {service.name_en && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {service.name_en}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-foreground whitespace-nowrap bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs border border-emerald-500/20">
                      {Number(service.internal_reference_price || 0).toLocaleString()} {service.currency || "EGP"}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => handleSelectService(service)}
                      className="gap-1 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{t("addToProposal")}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
