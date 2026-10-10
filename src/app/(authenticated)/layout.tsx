import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";

/**
 * Authenticated layout — wraps all protected pages with sidebar + header.
 * Redirects to /login if no authenticated user.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch latest profile from database to ensure header avatar and name are always in sync
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  const userWithProfile = {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      avatar_url: profile?.avatar_url !== undefined ? profile?.avatar_url : user.user_metadata?.avatar_url,
      role: profile?.role || user.user_metadata?.role,
    },
  };

  return (
    <MobileNavProvider>
      <div className="min-h-screen flex">
        <AppSidebar user={userWithProfile} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader user={userWithProfile} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
