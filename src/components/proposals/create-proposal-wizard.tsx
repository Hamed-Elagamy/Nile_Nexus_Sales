"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileText, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ProposalBuilder,
  type ProposalBuilderState,
} from "./proposal-builder";
import { createProposal } from "@/lib/actions/proposals";

interface ClientOption {
  id: string;
  name: string;
  business_id: string;
}

interface DealOption {
  id: string;
  title: string;
  client_id: string;
  business_id: string;
}

interface CreateProposalWizardProps {
  clients: ClientOption[];
  deals: DealOption[];
}

export function CreateProposalWizard({ clients, deals }: CreateProposalWizardProps) {
  const t = useTranslations("proposals");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState("");
  const [dealId, setDealId] = useState("");

  const [builderState, setBuilderState] = useState<ProposalBuilderState>({
    items: [
      {
        description_ar: "",
        quantity: 1,
        unit_price: 0,
        sort_order: 0,
      },
    ],
    currency: "EGP",
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 14,
    deliveryDuration: t("defaultDelivery"),
    paymentTerms: t("defaultPaymentTerms"),
    termsAndConditions: t("defaultTermsConditions"),
    validUntil: "",
    notes: "",
  });

  // Filter deals for the selected client
  const availableDeals = clientId
    ? deals.filter((d) => d.client_id === clientId)
    : deals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error(t("clientRequired"));
      return;
    }

    if (!dealId) {
      toast.error(t("dealRequired"));
      return;
    }

    const validItems = builderState.items.filter((it) => it.description_ar.trim().length > 0);
    if (validItems.length === 0) {
      toast.error(t("itemsRequired"));
      return;
    }

    startTransition(async () => {
      const res = await createProposal({
        client_id: clientId,
        deal_id: dealId,
        items: validItems,
        currency: builderState.currency,
        discount_percentage:
          builderState.discountPercentage > 0
            ? builderState.discountPercentage
            : undefined,
        discount_amount:
          builderState.discountAmount > 0 ? builderState.discountAmount : undefined,
        tax_percentage: builderState.taxPercentage,
        delivery_duration: builderState.deliveryDuration || undefined,
        payment_terms: builderState.paymentTerms || undefined,
        terms_and_conditions: builderState.termsAndConditions || undefined,
        valid_until: builderState.validUntil || undefined,
        notes: builderState.notes || undefined,
      });

      if (res.success && res.data) {
        toast.success(t("createSuccess"));
        router.push(`/proposals/${res.data.id}`);
      } else {
        toast.error(res.error || t("createFailed"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/proposals"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{tCommon("cancel")}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>{t("newProposalTitle")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("newProposalSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            {isPending ? tCommon("loading") : t("saveProposal")}
          </Button>
        </div>
      </div>

      {/* Client and Deal Selection */}
      <Card className="p-4 bg-card border-border space-y-4">
        <h3 className="text-xs font-semibold text-foreground">
          {t("clientAndDealData")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t("clientLabel")} <span className="text-destructive">*</span></span>
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setDealId("");
              }}
              required
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="">{t("selectClient")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.business_id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t("linkedDealLabel")} <span className="text-destructive">*</span></span>
            </label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              required
              disabled={!clientId}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {clientId ? t("selectDeal") : t("selectClientFirst")}
              </option>
              {availableDeals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.business_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Line Items & Calculations Builder */}
      <ProposalBuilder
        initialState={builderState}
        onChange={(newState) => setBuilderState(newState)}
      />
    </form>
  );
}
