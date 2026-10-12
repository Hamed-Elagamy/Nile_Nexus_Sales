"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Smartphone, Download, X, Share2, PlusSquare, Check } from "lucide-react";
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

export function PwaInstallPrompt() {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed & running standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);
    if (standalone) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("nile_pwa_dismissed") === "true";
    if (isDismissed) return;

    // Chromium beforeinstallprompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // On iOS, show banner if not standalone and on mobile
    let timer: NodeJS.Timeout | undefined;
    if (isIosDevice) {
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    // Custom open trigger listener for sidebar and settings buttons
    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowIosModal(true);
      }
    };

    window.addEventListener("open-pwa-install", handleCustomTrigger);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-pwa-install", handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosModal(true);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("nile_pwa_dismissed", "true");
  };

  if (isStandalone || !showBanner) {
    return (
      <>
        {/* iOS Manual Guide Modal if invoked */}
        {showIosModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-3 end-3 p-1 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)]">
                    {t("iosTitle")}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("iosSubtitle")}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                      {t("iosStep1")} <Share2 className="h-3.5 w-3.5 text-blue-500 inline" />
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {t("iosStep1Desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                      {t("iosStep2")} <PlusSquare className="h-3.5 w-3.5 text-blue-500 inline" />
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {t("iosStep2Desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                      {t("iosStep3")} <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {t("iosStep3Desc")}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full text-xs"
                onClick={() => setShowIosModal(false)}
              >
                {t("understoodBtn")}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Floating Mobile Install Bar */}
      <div className="md:hidden fixed bottom-18 inset-x-3 z-40 bg-[var(--card)]/95 backdrop-blur-md border border-primary/30 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Smartphone className="h-5 w-5" />
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
              <Download className="h-3.5 w-3.5 me-1" />
              <span>{t("installBtn")}</span>
            </Button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-label={t("dismiss")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-3 end-3 p-1 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">
                  {t("iosTitle")}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("iosSubtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  1
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                    {t("iosStep1")} <Share2 className="h-3.5 w-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {t("iosStep1Desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  2
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                    {t("iosStep2")} <PlusSquare className="h-3.5 w-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {t("iosStep2Desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--muted)]/50">
                <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  3
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                    {t("iosStep3")} <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {t("iosStep3Desc")}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full text-xs"
              onClick={() => setShowIosModal(false)}
            >
              {t("understoodBtn")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
