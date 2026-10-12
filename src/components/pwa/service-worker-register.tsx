"use client";

import { useEffect } from "react";

// Capture beforeinstallprompt as early as module evaluation
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    (window as unknown as { __pwaInstallPrompt?: Event }).__pwaInstallPrompt = e;
    window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
  });
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.debug("[PWA] Service Worker registered:", registration.scope);
            // Proactively check for updates immediately
            registration.update().catch(() => {});
          })
          .catch((error) => {
            console.debug("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
