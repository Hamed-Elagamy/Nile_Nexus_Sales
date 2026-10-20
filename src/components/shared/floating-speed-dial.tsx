"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  X,
  UserPlus,
  FileText,
  Calculator,
  Edit3,
  Copy,
  Coffee,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";

interface FloatingSpeedDialProps {
  onOpenVatCalculator: () => void;
  onOpenScratchpad: () => void;
  onOpenSnippets: () => void;
}

export function FloatingSpeedDial({
  onOpenVatCalculator,
  onOpenScratchpad,
  onOpenSnippets,
}: FloatingSpeedDialProps) {
  const router = useRouter();
  const t = useTranslations("speedDial");
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    sounds.playTactileClick();
    setIsOpen((prev) => !prev);
  };

  const handleAction = (action: () => void) => {
    sounds.playTactileClick();
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* Dimmed backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Positioned comfortably above the mobile bottom bar (bottom-20) and standard bottom-6 on desktop */}
      <div className="fixed bottom-20 md:bottom-6 end-4 sm:end-6 z-50 flex flex-col items-end gap-2.5">
        {/* Expanded Actions Stack */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-150">
            {/* Action 0: Coffex Onsite Lead */}
            <button
              type="button"
              onClick={() => handleAction(() => router.push("/coffex"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-amber-500/30 shadow-lg hover:bg-amber-500/10 text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-foreground group-hover:text-amber-600">
                {t("coffexLead")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coffee className="h-4 w-4" />
              </div>
            </button>

            {/* Action 1: Add Lead */}
            <button
              type="button"
              onClick={() => handleAction(() => router.push("/potential-clients"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg hover:bg-muted text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                {t("addLead")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <UserPlus className="h-4 w-4" />
              </div>
            </button>

            {/* Action 2: New Proposal */}
            <button
              type="button"
              onClick={() => handleAction(() => router.push("/proposals/new"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg hover:bg-muted text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600">
                {t("newProposal")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            </button>

            {/* Action 3: VAT & Installments Calculator */}
            <button
              type="button"
              onClick={() => handleAction(onOpenVatCalculator)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg hover:bg-muted text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-semibold text-foreground group-hover:text-amber-600">
                {t("vatCalculator")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Calculator className="h-4 w-4" />
              </div>
            </button>

            {/* Action 4: Sales Scratchpad */}
            <button
              type="button"
              onClick={() => handleAction(onOpenScratchpad)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg hover:bg-muted text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-semibold text-foreground group-hover:text-violet-600">
                {t("scratchpad")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Edit3 className="h-4 w-4" />
              </div>
            </button>

            {/* Action 5: Smart Snippets */}
            <button
              type="button"
              onClick={() => handleAction(onOpenSnippets)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg hover:bg-muted text-foreground transition-all cursor-pointer group"
            >
              <span className="text-xs font-semibold text-foreground group-hover:text-cyan-600">
                {t("snippets")}
              </span>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Copy className="h-4 w-4" />
              </div>
            </button>
          </div>
        )}

        {/* Main Trigger Button */}
        <button
          type="button"
          onClick={toggle}
          aria-label={t("quickTools")}
          title={t("quickTools")}
          className={`h-12 w-12 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer ${
            isOpen
              ? "bg-slate-700 dark:bg-slate-600 rotate-90 scale-95"
              : "bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-primary/30"
          }`}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-6 w-6 stroke-[2.5]" />}
        </button>
      </div>
    </>
  );
}
