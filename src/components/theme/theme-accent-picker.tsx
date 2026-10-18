"use client";

import React, { useState } from "react";
import { Palette, Volume2, VolumeX, Maximize2, Sparkles, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useThemeAccent, type ThemePalette } from "./theme-accent-provider";
import { triggerCelebrationConfetti, sounds } from "@/lib/utils/confetti-sound";

const palettes: Array<{ id: ThemePalette; name: string; color: string; desc: string }> = [
  { id: "nile", name: "أزرق النيل", color: "#2563eb", desc: "الهوية الكلاسيكية الملكية" },
  { id: "emerald", name: "زمردي فاخر", color: "#059669", desc: "طاقة النمو والمال" },
  { id: "royal", name: "بنفسجي ملكي", color: "#7c3aed", desc: "فخامة التقنية والذكاء" },
  { id: "amber", name: "برتقالي دافئ", color: "#ea580c", desc: "نشاط وحماس المبيعات" },
  { id: "obsidian", name: "أسود نيون", color: "#06b6d4", desc: "ستايل OLED تقني مضيء" },
];

export function ThemeAccentPicker() {
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

  const handleTestCelebration = () => {
    triggerCelebrationConfetti(3000);
    sounds.playWonChime();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-8 w-8 text-muted-foreground hover:text-foreground relative cursor-pointer"
            title="تخصيص الثيم والألوان والمؤثرات"
          >
            <Palette className="h-4 w-4 text-primary" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-64 p-2 space-y-2">
        <DropdownMenuLabel className="text-xs font-bold text-foreground flex items-center justify-between pb-1">
          <span>هوية وألوان النظام</span>
          <span className="text-[10px] text-muted-foreground font-normal">Luxury Themes</span>
        </DropdownMenuLabel>

        {/* Palette Swatches Grid */}
        <div className="grid grid-cols-5 gap-1.5 py-1">
          {palettes.map((p) => {
            const isSelected = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                className={`group relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/60 hover:border-border hover:bg-muted/50"
                }`}
                title={`${p.name} - ${p.desc}`}
              >
                <span
                  className="h-5 w-5 rounded-full shadow-inner flex items-center justify-center shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                </span>
                <span className="text-[9px] font-medium text-foreground mt-1 truncate max-w-full">
                  {p.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Density Mode */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-foreground">كثافة الجداول:</span>
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md text-[11px]">
            <button
              type="button"
              onClick={() => setDensity("normal")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                density === "normal"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              عادي
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                density === "compact"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              مضغوط
            </button>
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <DropdownMenuItem
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center justify-between text-xs cursor-pointer py-1.5"
        >
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>المؤثرات الصوتية التكتيكية</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              soundEnabled ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
            }`}
          >
            {soundEnabled ? "مفعل" : "صامت"}
          </span>
        </DropdownMenuItem>

        {/* Zen Mode Button */}
        <DropdownMenuItem
          onClick={toggleZenMode}
          className="flex items-center gap-2 text-xs cursor-pointer py-1.5 text-primary"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>وضع التركيز والعرض النظيف (Zen Mode)</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Test Celebration Confetti */}
        <button
          type="button"
          onClick={handleTestCelebration}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 text-primary hover:bg-primary/25 text-xs font-semibold transition-all cursor-pointer border border-primary/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>تجربة احتفال الصفقات 🎉</span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
