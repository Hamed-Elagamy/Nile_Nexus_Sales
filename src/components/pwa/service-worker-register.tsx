"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.debug("[PWA] Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.debug("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
