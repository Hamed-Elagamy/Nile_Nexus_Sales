"use client";

import React, { createContext, useContext, useState } from "react";
import { CommandPalette } from "./command-palette";
import { VatInstallmentCalculator } from "./vat-installment-calculator";
import { FloatingScratchpad } from "./floating-scratchpad";
import { SmartSnippetsDialog } from "./smart-snippets-dialog";
import { FloatingSpeedDial } from "./floating-speed-dial";
import { ProjectEstimatorDialog } from "@/components/sales/project-estimator-dialog";
import { RoiCalculatorDialog } from "@/components/sales/roi-calculator-dialog";
import { ObjectionBattlecardsDialog } from "@/components/sales/objection-battlecards-dialog";
import { BulkImportDialog } from "@/components/potential-clients/bulk-import-dialog";
import { WhatsAppSequencesDialog } from "./whatsapp-sequences-dialog";

interface SalesToolsContextType {
  openCommandPalette: () => void;
  openVatCalculator: (amount?: number) => void;
  openScratchpad: () => void;
  openSnippets: () => void;
  openEstimator: () => void;
  openRoiCalculator: () => void;
  openBattlecards: () => void;
  openBulkImport: () => void;
  openWhatsAppSequences: (phone?: string, name?: string, company?: string) => void;
}

const SalesToolsContext = createContext<SalesToolsContextType | null>(null);

export function SalesToolsProvider({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [vatCalculatorOpen, setVatCalculatorOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [roiOpen, setRoiOpen] = useState(false);
  const [battlecardsOpen, setBattlecardsOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // WhatsApp Sequences Dialog State
  const [waSequencesOpen, setWaSequencesOpen] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waName, setWaName] = useState("");
  const [waCompany, setWaCompany] = useState("");

  const openCommandPalette = () => setCommandPaletteOpen(true);
  const openVatCalculator = (amount?: number) => {
    if (amount) setCalcAmount(amount);
    setVatCalculatorOpen(true);
  };
  const openScratchpad = () => setScratchpadOpen(true);
  const openSnippets = () => setSnippetsOpen(true);
  const openEstimator = () => setEstimatorOpen(true);
  const openRoiCalculator = () => setRoiOpen(true);
  const openBattlecards = () => setBattlecardsOpen(true);
  const openBulkImport = () => setBulkImportOpen(true);

  const openWhatsAppSequences = (phone = "", name = "", company = "") => {
    setWaPhone(phone);
    setWaName(name);
    setWaCompany(company);
    setWaSequencesOpen(true);
  };

  return (
    <SalesToolsContext.Provider
      value={{
        openCommandPalette,
        openVatCalculator,
        openScratchpad,
        openSnippets,
        openEstimator,
        openRoiCalculator,
        openBattlecards,
        openBulkImport,
        openWhatsAppSequences,
      }}
    >
      {children}

      {/* Global Interactive Modals & Drawers */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenVatCalculator={openVatCalculator}
        onOpenScratchpad={openScratchpad}
        onOpenSnippets={openSnippets}
        onOpenEstimator={openEstimator}
        onOpenRoiCalculator={openRoiCalculator}
        onOpenBattlecards={openBattlecards}
        onOpenBulkImport={openBulkImport}
        onOpenWhatsAppSequences={() => openWhatsAppSequences()}
      />

      <VatInstallmentCalculator
        open={vatCalculatorOpen}
        onOpenChange={setVatCalculatorOpen}
        initialAmount={calcAmount}
      />

      <FloatingScratchpad
        open={scratchpadOpen}
        onOpenChange={setScratchpadOpen}
      />

      <SmartSnippetsDialog
        open={snippetsOpen}
        onOpenChange={setSnippetsOpen}
      />

      <ProjectEstimatorDialog
        open={estimatorOpen}
        onOpenChange={setEstimatorOpen}
      />

      <RoiCalculatorDialog
        open={roiOpen}
        onOpenChange={setRoiOpen}
      />

      <ObjectionBattlecardsDialog
        open={battlecardsOpen}
        onOpenChange={setBattlecardsOpen}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />

      <WhatsAppSequencesDialog
        open={waSequencesOpen}
        onOpenChange={setWaSequencesOpen}
        defaultPhone={waPhone}
        defaultClientName={waName}
        defaultCompanyName={waCompany}
      />

      {/* Floating Speed Dial on bottom-end */}
      <FloatingSpeedDial
        onOpenVatCalculator={openVatCalculator}
        onOpenScratchpad={openScratchpad}
        onOpenSnippets={openSnippets}
      />
    </SalesToolsContext.Provider>
  );
}

export function useSalesTools() {
  const ctx = useContext(SalesToolsContext);
  if (!ctx) {
    throw new Error("useSalesTools must be used within SalesToolsProvider");
  }
  return ctx;
}
