"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { sounds } from "@/lib/utils/confetti-sound";

export type ThemePalette = "nile" | "emerald" | "royal" | "amber" | "obsidian";
export type FontFamily = "cairo" | "alexandria" | "ibm";
export type DensityMode = "normal" | "compact";

interface ThemeAccentContextType {
  palette: ThemePalette;
  setPalette: (p: ThemePalette) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  density: DensityMode;
  setDensity: (d: DensityMode) => void;
  zenMode: boolean;
  setZenMode: (z: boolean) => void;
  toggleZenMode: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
}

const ThemeAccentContext = createContext<ThemeAccentContextType | null>(null);

const STORAGE_PALETTE = "nile_theme_palette";
const STORAGE_FONT = "nile_theme_font";
const STORAGE_DENSITY = "nile_theme_density";

export function ThemeAccentProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<ThemePalette>("nile");
  const [fontFamily, setFontFamilyState] = useState<FontFamily>("cairo");
  const [density, setDensityState] = useState<DensityMode>("normal");
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted settings
    const savedPalette = (localStorage.getItem(STORAGE_PALETTE) as ThemePalette) || "nile";
    const savedFont = (localStorage.getItem(STORAGE_FONT) as FontFamily) || "cairo";
    const savedDensity = (localStorage.getItem(STORAGE_DENSITY) as DensityMode) || "normal";

    setPaletteState(savedPalette);
    setFontFamilyState(savedFont);
    setDensityState(savedDensity);
    setSoundEnabledState(sounds.isSoundEnabled());

    applyToDOM(savedPalette, savedFont, savedDensity);
  }, []);

  const applyToDOM = (p: ThemePalette, f: FontFamily, d: DensityMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.setAttribute("data-palette", p);
    root.setAttribute("data-font", f);
    root.setAttribute("data-density", d);
  };

  const setPalette = (p: ThemePalette) => {
    setPaletteState(p);
    localStorage.setItem(STORAGE_PALETTE, p);
    applyToDOM(p, fontFamily, density);
    sounds.playTactileClick();
  };

  const setFontFamily = (f: FontFamily) => {
    setFontFamilyState(f);
    localStorage.setItem(STORAGE_FONT, f);
    applyToDOM(palette, f, density);
    sounds.playTactileClick();
  };

  const setDensity = (d: DensityMode) => {
    setDensityState(d);
    localStorage.setItem(STORAGE_DENSITY, d);
    applyToDOM(palette, fontFamily, d);
    sounds.playTactileClick();
  };

  const toggleZenMode = () => {
    setZenMode((prev) => {
      const next = !prev;
      sounds.playTactileClick();
      return next;
    });
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.setSoundEnabled(enabled);
    if (enabled) {
      sounds.playSuccessBlip();
    }
  };

  return (
    <ThemeAccentContext.Provider
      value={{
        palette,
        setPalette,
        fontFamily,
        setFontFamily,
        density,
        setDensity,
        zenMode,
        setZenMode,
        toggleZenMode,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      <div
        className={`contents ${zenMode ? "zen-mode-active" : ""} ${
          density === "compact" ? "density-compact" : ""
        }`}
      >
        {children}
      </div>
    </ThemeAccentContext.Provider>
  );
}

export function useThemeAccent() {
  const context = useContext(ThemeAccentContext);
  if (!context) {
    throw new Error("useThemeAccent must be used within ThemeAccentProvider");
  }
  return context;
}
