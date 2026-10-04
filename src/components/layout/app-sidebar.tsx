"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
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

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
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

        {/* Nav Items */}
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
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[var(--sidebar-background)] border-t border-[var(--sidebar-border)] z-50 px-2 py-1 safe-area-pb">
        <div className="flex items-center justify-around">
          {[
            navItems[0], // Dashboard
            navItems[2], // Clients
            navItems[3], // Deals
            navItems[5], // Follow-ups
            navItems[12], // Notifications
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
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs transition-colors",
                  isActive
                    ? "text-[var(--sidebar-primary)]"
                    : "text-[var(--sidebar-foreground)]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
