"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Smartphone,
  Download,
  X,
  Share2,
  PlusSquare,
  Check,
  Monitor,
  Laptop,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function triggerPwaInstall(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  }
}

type PlatformTab = "windows" | "android" | "ios";

export function PwaInstallPrompt() {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>("windows");
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Platform detection & prompt listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);
    if (standalone) return;

    // Detect user OS
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab("ios");
    } else if (/android/.test(ua)) {
      setActiveTab("android");
    } else {
      setActiveTab("windows");
    }

    // Check if prompt was captured early in window scope
    const existingPrompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
    if (existingPrompt) {
      setDeferredPrompt(existingPrompt);
    }

    // Capture beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-prompt-available", () => {
      const p = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
      if (p) setDeferredPrompt(p);
    });

    // Custom open trigger listener
    const handleCustomTrigger = () => {
      setShowModal(true);
    };

    window.addEventListener("open-pwa-install", handleCustomTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-pwa-install", handleCustomTrigger);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    const prompt = deferredPrompt || (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;

    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setShowBanner(false);
          setShowModal(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.debug("[PWA] Prompt error:", err);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  }, [deferredPrompt]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("nile_pwa_dismissed", "true");
  };

  if (isStandalone) {
    return null;
  }

  const promptAvailable = Boolean(deferredPrompt || (typeof window !== "undefined" && (window as unknown as { __pwaInstallPrompt?: unknown }).__pwaInstallPrompt));

  return (
    <>
      {/* Floating Mobile/Tablet Install Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-18 inset-x-3 z-40 bg-[var(--card)]/95 backdrop-blur-md border border-primary/30 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom duration-300 md:max-w-md md:inset-x-auto md:end-6 md:bottom-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Download className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                {t("bannerTitle")}
              </h4>
              <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                {t("bannerSubtitle")}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                className="text-xs h-8 px-3 font-semibold shadow-xs"
                onClick={handleInstallClick}
              >
                <span>{t("installBtn")}</span>
              </Button>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label={t("dismiss")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Platform Universal Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 end-4 p-1.5 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                <Download className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  {t("modalTitle")}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("modalSubtitle")}
                </p>
              </div>
            </div>

            {/* 1-Click Direct Install Button if Browser Supports it */}
            {promptAvailable && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("directInstallDesc")}</span>
                  </span>
                </div>
                <Button
                  className="w-full text-xs font-bold h-9 shadow-xs"
                  onClick={handleInstallClick}
                >
                  <Download className="h-4 w-4 me-1.5" />
                  <span>{t("directInstallBtn")}</span>
                </Button>
              </div>
            )}

            {/* Platform Selection Tabs */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                اختر نوع جهازك لمعرفة خطوات التثبيت:
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--muted)] rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("windows")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "windows"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t("tabWindows")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("android")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "android"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate">{t("tabAndroid")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ios")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "ios"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  <span className="truncate">{t("tabIos")}</span>
                </button>
              </div>
            </div>

            {/* Platform Guides */}
            <div className="space-y-3 pt-1 text-xs">
              {/* WINDOWS PC TAB */}
              {activeTab === "windows" && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("winStep1")}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("winStep1Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("winStep2")}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("winStep2Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("winStep3")} <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("winStep3Desc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ANDROID TAB */}
              {activeTab === "android" && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("androidStep1")}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("androidStep1Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("androidStep2")} <PlusSquare className="h-3.5 w-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("androidStep2Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("androidStep3")} <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("androidStep3Desc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* IPHONE / IOS TAB */}
              {activeTab === "ios" && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("iosStep1")} <Share2 className="h-3.5 w-3.5 text-blue-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("iosStep1Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("iosStep2")} <PlusSquare className="h-3.5 w-3.5 text-blue-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("iosStep2Desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                        {t("iosStep3")} <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {t("iosStep3Desc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="default"
              className="w-full text-xs font-semibold h-9"
              onClick={() => setShowModal(false)}
            >
              {t("understoodBtn")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
