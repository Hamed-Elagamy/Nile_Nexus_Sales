import { LoginForm } from "@/components/auth/login-form";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--accent)] p-4 relative">
      <div className="absolute top-4 end-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Tammlo"
            className="h-12 sm:h-14 w-auto object-contain dark:hidden mb-2"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-dark.png"
            alt="Tammlo"
            className="h-12 sm:h-14 w-auto object-contain hidden dark:block mb-2"
          />
          <span className="text-[11px] tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full font-semibold">
            Sales CRM
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
