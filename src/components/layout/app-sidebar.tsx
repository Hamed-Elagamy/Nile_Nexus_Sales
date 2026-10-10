"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Search,
  Users,
  Briefcase,
  GitBranch,
  Phone,
  CheckSquare,
  Calendar,
  FileText,
  ShieldCheck,
  UserCog,
  BarChart3,
  Bell,
  Settings,
  LayoutGrid,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./mobile-nav-context";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User } from "@supabase/supabase-js";

export const navItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "potentialClients", href: "/potential-clients", icon: Search },
  { key: "clients", href: "/clients", icon: Users },
  { key: "deals", href: "/deals", icon: Briefcase },
  { key: "pipeline", href: "/pipeline", icon: GitBranch },
  { key: "followUps", href: "/follow-ups", icon: Phone },
  { key: "tasks", href: "/tasks", icon: CheckSquare },
  { key: "calendar", href: "/calendar", icon: Calendar },
  { key: "proposals", href: "/proposals", icon: FileText },
  { key: "approvals", href: "/approvals", icon: ShieldCheck },
  { key: "team", href: "/team", icon: UserCog },
  { key: "reports", href: "/reports", icon: BarChart3 },
  { key: "notifications", href: "/notifications", icon: Bell },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

interface AppSidebarProps {
  user?: User & {
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
      role?: string;
    };
  };
}

export function AppSidebar({ user }: AppSidebarProps = {}) {
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();
  const mobileNav = useMobileNav();

  const isConfigured = isSupabaseConfigured();

  const handleSignOut = async () => {
    if (isConfigured) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore sign out errors
      }
    }
    document.cookie = "nile_demo_signed_out=true; path=/; max-age=86400";
    document.cookie = "nile_demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    mobileNav.close();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const userRole = user?.user_metadata?.role || "GM";

  // Check if current page is one of the secondary 10 tabs (not in bottom 4)
  const primaryHrefs = ["/dashboard", "/clients", "/deals", "/follow-ups"];
  const isOtherActive = !primaryHrefs.some(
    (h) => pathname === h || (h !== "/dashboard" && pathname.startsWith(h))
  );

  return (
    <>
      {/* ============================================================== */}
      {/* Desktop Sidebar (visible on md screens and wider)             */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-64 border-e border-[var(--sidebar-border)] bg-[var(--sidebar-background)] h-screen sticky top-0">
        {/* Brand */}
        <div className="p-5 border-b border-[var(--sidebar-border)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--sidebar-primary)]">
              Nile Nexus
            </span>
            <span className="text-xs bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] px-2 py-0.5 rounded-full font-medium">
              Sales
            </span>
          </Link>
        </div>

        {/* Desktop Nav Items (All 14) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tNav(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ============================================================== */}
      {/* Mobile Slide-Over Drawer (Shows ALL 14 items)                 */}
      {/* ============================================================== */}
      {mobileNav.isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            onClick={mobileNav.close}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in-0"
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <aside
            className="fixed inset-y-0 start-0 w-[84vw] max-w-xs bg-[var(--sidebar-background)] border-e border-[var(--sidebar-border)] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-start duration-200"
            aria-label={tNav("allSections")}
          >
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between">
                <Link
                  href="/dashboard"
                  onClick={mobileNav.close}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg font-bold text-[var(--sidebar-primary)]">
                    Nile Nexus
                  </span>
                  <span className="text-[10px] bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] px-2 py-0.5 rounded-full font-medium">
                    Sales
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={mobileNav.close}
                  className="p-1.5 rounded-lg hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile Summary */}
              {user && (
                <div className="p-4 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-accent)]/30">
                  <Link
                    href="/settings"
                    onClick={mobileNav.close}
                    className="flex items-center gap-3 hover:opacity-85 transition-opacity"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {displayName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                          {userRole}
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)] truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* All 14 Navigation Items */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {tNav("allSections")} ({navItems.length})
                </div>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={mobileNav.close}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-xs"
                          : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{tNav(item.key)}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-accent)]/15 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {tNav("settings")} / اللغة
                  </span>
                  <LanguageSwitcher />
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{tAuth("logout")}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* Mobile Bottom Navigation Bar                                  */}
      {/* Shows 4 quick-access tabs + 5th "More" tab to open full drawer */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[var(--sidebar-background)]/95 backdrop-blur-md border-t border-[var(--sidebar-border)] z-40 px-2 py-1 safe-area-pb shadow-lg">
        <div className="flex items-center justify-around">
          {/* 4 Primary Navigation Links */}
          {[
            navItems[0], // Dashboard
            navItems[2], // Clients
            navItems[3], // Deals
            navItems[5], // Follow-ups
          ].map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "text-[var(--sidebar-primary)] font-bold"
                    : "text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-primary)]"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="truncate text-[11px]">{tNav(item.key)}</span>
              </Link>
            );
          })}

          {/* 5th "More / المزيد" Tab: Opens Slide-Over Drawer with all 14 tabs */}
          <button
            type="button"
            onClick={mobileNav.toggle}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer relative",
              mobileNav.isOpen || isOtherActive
                ? "text-[var(--sidebar-primary)] font-bold"
                : "text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-primary)]"
            )}
            aria-label={tNav("more")}
            title={tNav("allSections")}
          >
            <LayoutGrid
              className={cn(
                "h-5 w-5",
                (mobileNav.isOpen || isOtherActive) && "stroke-[2.5px]"
              )}
            />
            <span className="truncate text-[11px]">{tNav("more")}</span>
            {isOtherActive && !mobileNav.isOpen && (
              <span className="absolute top-1 end-2.5 h-1.5 w-1.5 rounded-full bg-[var(--sidebar-primary)] ring-2 ring-[var(--sidebar-background)]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
