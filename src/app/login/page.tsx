import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--accent)] p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary)]">
            Nile Nexus Sales
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
