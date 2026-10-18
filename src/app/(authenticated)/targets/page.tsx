"use client";

import React from "react";
import { CommissionQuotaSimulator } from "@/components/sales/commission-quota-simulator";
import Link from "next/link";
import { ArrowLeft, Target, Award } from "lucide-react";

export default function TargetsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>الرئيسية</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-primary">المستهدفات والعمولات</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">مستهدفات المبيعات والعمولات (Targets & Quotas)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          متابعة تحقيق التارجت الفردي والجماعي وحساب العمولات الشرائحية ونوادي التميز التنافسية.
        </p>
      </div>

      <CommissionQuotaSimulator />
    </div>
  );
}
