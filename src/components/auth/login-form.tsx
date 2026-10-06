"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus, Mail, Lock, User, ShieldCheck, CheckCircle2 } from "lucide-react";

type AuthMode = "signin" | "signup";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"GM" | "ADMIN" | "SALES">("SALES");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError(
          t("checkEmailConfirmation")
        );
      } else {
        setError(t("invalidCredentials"));
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError(t("fullName") + " " + t("required", { defaultValue: "مطلوب" }));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل (Password must be at least 6 characters)");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.session) {
      // User is immediately authenticated (email confirmation is off)
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation is required
      setSuccess(t("signUpSuccess") + " " + t("checkEmailConfirmation"));
      setMode("signin");
    }
  };

  return (
    <div className="space-y-6">
      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[var(--muted)] rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError("");
            setSuccess("");
          }}
          className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mode === "signin"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>{t("login")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
            setSuccess("");
          }}
          className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mode === "signup"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{t("signUp")}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {mode === "signin" ? t("loginTitle") : t("signUpTitle")}
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          {mode === "signin" ? t("loginSubtitle") : t("signUpSubtitle")}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 leading-relaxed">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg border border-red-200 dark:border-red-800 leading-relaxed">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
        {mode === "signup" && (
          <>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="text-xs font-semibold text-[var(--foreground)]"
              >
                {t("fullName")}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full ps-10 pe-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
                  placeholder={t("fullNamePlaceholder")}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label
                htmlFor="role"
                className="text-xs font-semibold text-[var(--foreground)]"
              >
                {t("role")}
              </label>
              <div className="relative">
                <ShieldCheck className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "GM" | "ADMIN" | "SALES")}
                  className="w-full ps-10 pe-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
                >
                  <option value="GM">{t("roleGm")}</option>
                  <option value="ADMIN">{t("roleAdmin")}</option>
                  <option value="SALES">{t("roleSales")}</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-[var(--foreground)]"
          >
            {t("email")}
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
              placeholder="name@company.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[var(--foreground)]"
            >
              {t("password")}
            </label>
            {mode === "signin" && (
              <a
                href="/auth/reset-password"
                className="text-[11px] text-[var(--primary)] hover:underline"
              >
                {t("forgotPassword")}
              </a>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            <LogIn className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          <span>{mode === "signin" ? t("loginButton") : t("signUpButton")}</span>
        </button>
      </form>

      {/* Switch between Sign In / Sign Up */}
      <div className="pt-2 text-center text-xs text-[var(--muted-foreground)]">
        {mode === "signin" ? (
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccess("");
            }}
            className="text-[var(--primary)] hover:underline font-medium cursor-pointer"
          >
            {t("noAccount")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccess("");
            }}
            className="text-[var(--primary)] hover:underline font-medium cursor-pointer"
          >
            {t("hasAccount")}
          </button>
        )}
      </div>
    </div>
  );
}
