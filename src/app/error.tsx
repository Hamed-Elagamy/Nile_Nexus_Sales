"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error securely for diagnostics
    console.error("[Nile Nexus Error Boundary]:", error);
  }, [error]);

  const handleRetry = () => {
    try {
      sounds.playTactileClick();
    } catch {
      // ignore sound errors
    }
    reset();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            حدث خطأ أثناء تحميل الصفحة
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Something went wrong while loading this page
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            نعتذر عن هذا العطل المؤقت. يمكنك الضغط على زر إعادة المحاولة أو العودة للصفحة الرئيسية للمتابعة.
          </p>
          {error.digest && (
            <div className="pt-2">
              <span className="inline-block text-[10px] font-mono text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-md">
                Error ID: {error.digest}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة / Retry</span>
          </button>

          <a
            href="/"
            className="w-full sm:flex-1 h-11 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Home className="w-4 h-4 text-muted-foreground" />
            <span>الرئيسية / Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
