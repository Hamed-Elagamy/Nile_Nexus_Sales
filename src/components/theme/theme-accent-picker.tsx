"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Palette,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { useThemeAccent, type ThemePalette } from "./theme-accent-provider";
import { triggerCelebrationConfetti, sounds } from "@/lib/utils/confetti-sound";

export function ThemeAccentPicker() {
  const t = useTranslations("themePicker");
  const {
    palette,
    setPalette,
    density,
    setDensity,
    soundEnabled,
    setSoundEnabled,
    toggleZenMode,
  } = useThemeAccent();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleTestCelebration = () => {
    triggerCelebrationConfetti(3000);
    sounds.playWonChime();
  };

  const palettes: Array<{
    id: ThemePalette;
    nameKey: "nile" | "emerald" | "royal" | "amber" | "obsidian";
    descKey: "nileDesc" | "emeraldDesc" | "royalDesc" | "amberDesc" | "obsidianDesc";
    color: string;
  }> = [
    { id: "nile", nameKey: "nile", descKey: "nileDesc", color: "#2563eb" },
    { id: "emerald", nameKey: "emerald", descKey: "emeraldDesc", color: "#059669" },
    { id: "royal", nameKey: "royal", descKey: "royalDesc", color: "#7c3aed" },
    { id: "amber", nameKey: "amber", descKey: "amberDesc", color: "#ea580c" },
    { id: "obsidian", nameKey: "obsidian", descKey: "obsidianDesc", color: "#06b6d4" },
  ];

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playTactileClick();
          setIsOpen((prev) => !prev);
        }}
        aria-label={t("tooltip")}
        title={t("tooltip")}
        aria-expanded={isOpen}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer relative"
      >
        <Palette className="h-4 w-4 text-primary" />
        <span
          className="absolute bottom-1 end-1 h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              palettes.find((p) => p.id === palette)?.color || "#2563eb",
          }}
        />
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          className="absolute end-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-3 space-y-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-border/50">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">
                {t("title")}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                {t("subtitle")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Palette Swatches Grid */}
          <div className="grid grid-cols-5 gap-1.5 py-1">
            {palettes.map((p) => {
              const isSelected = palette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPalette(p.id)}
                  className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : "border-border/60 hover:border-border hover:bg-muted/50"
                  }`}
                  title={`${t(p.nameKey)} - ${t(p.descKey)}`}
                >
                  <span
                    className="h-5 w-5 rounded-full shadow-inner flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: p.color }}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    )}
                  </span>
                  <span className="text-[9px] font-medium text-foreground mt-1 truncate max-w-full">
                    {t(p.nameKey).split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-border/50" />

          {/* Table Density Mode */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-foreground">
              {t("density")}
            </span>
            <div className="flex items-center gap-1 bg-muted/80 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setDensity("normal")}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  density === "normal"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("densityNormal")}
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  density === "compact"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("densityCompact")}
              </button>
            </div>
          </div>

          {/* Tactical Sound FX Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/70 text-foreground transition-all cursor-pointer border border-border/50"
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="font-medium">{t("soundFx")}</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                soundEnabled
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {soundEnabled ? t("soundEnabled") : t("soundDisabled")}
            </span>
          </button>

          {/* Zen Mode Button */}
          <button
            type="button"
            onClick={() => {
              toggleZenMode();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-primary hover:bg-primary/10 transition-all cursor-pointer border border-primary/20 text-start"
          >
            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">{t("zenMode")}</span>
          </button>

          {/* Test Confetti Celebration */}
          <button
            type="button"
            onClick={handleTestCelebration}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-primary/15 via-primary/25 to-primary/15 text-primary hover:bg-primary/30 text-xs font-bold transition-all cursor-pointer border border-primary/30 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("testConfetti")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
